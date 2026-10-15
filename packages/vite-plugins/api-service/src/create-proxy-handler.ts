import type ProxyServer from 'http-proxy';

import type {
  ApiRoute,
  JsonData,
  ApiProxyHandler,
  PluginLogger,
  IncomingRequest,
} from './types.js';
import { DEFAULT_VALUES } from './default-values.js';
import { createResponseInterceptor } from './create-response-interceptor.js';
import { blockMockTokenUpstream } from './block-mock-token-upstream.js';
import type { Connect } from 'vite';
import type { ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';

/** How long a successful service discovery response is reused. */
const SUCCESS_TTL_MS = 60_000;

/** How long a failed service discovery status is replayed without calling upstream. */
const FAILURE_TTL_MS = 10_000;

/**
 * Builds the cache key for a service discovery request, or `undefined` for non-`GET` requests.
 * The `Authorization` hash keeps a cached failure for one token from reaching another.
 *
 * @param req - Incoming request, in the cache middleware or the proxy response handler.
 * @returns The cache key, or `undefined` when the request must not be cached.
 */
const cacheKey = (req: Connect.IncomingMessage): string | undefined =>
  req.method === 'GET'
    ? `${req.originalUrl ?? req.url}#${createHash('sha256')
        .update(req.headers.authorization ?? '')
        .digest('hex')}`
    : undefined;

/**
 * Callback that processes a service discovery response and produces
 * transformed data plus dynamically generated API routes.
 *
 * `ApiDataProcessor` is the core integration point for service discovery:
 * the plugin calls this function with the JSON body returned by the
 * discovery endpoint, and the function returns the data to send to the
 * client together with proxy routes the plugin should register.
 *
 * @template TResponse - Shape of the raw JSON response from the discovery endpoint.
 * @template TResult - Shape of the transformed JSON sent back to the client.
 *
 * @param data - The raw service discovery response body.
 * @param args - Contextual information about the current request.
 * @param args.route - The base API route path (e.g. `'/@fusion-api'`).
 * @param args.request - The original incoming Connect request.
 * @returns An object with `data` (the response payload for the client) and an
 *   optional `routes` array of {@link ApiRoute} definitions to register.
 */
export type ApiDataProcessor<
  TResponse extends JsonData = JsonData,
  TResult extends JsonData = TResponse,
> = (
  data: TResponse,
  args: {
    route: string;
    request: Connect.IncomingMessage;
  },
) => {
  data: TResult;
  routes?: ApiRoute[];
};

/**
 * Creates an {@link ApiProxyHandler} that proxies requests to a service
 * discovery endpoint, transforms the response using `generateRoutes`, and
 * dynamically registers the resulting API routes for subsequent proxying.
 *
 * The returned handler is intended to be passed as the `proxyHandler` argument
 * to the {@link plugin} factory. On each service discovery response the
 * handler re-generates its route table, so route changes are picked up
 * automatically.
 *
 * Service discovery responses are cached in memory so that browser reload loops do not
 * flood the upstream discovery API: successful responses are reused for 60 seconds and
 * failed status codes are replayed for 10 seconds. Cached payloads are still passed
 * through `generateRoutes` per request, so request-dependent output (for example URIs
 * derived from the `referer`) stays correct.
 *
 * @template TResponse - Shape of the raw JSON response from the discovery endpoint.
 * @template TResult - Shape of the transformed JSON sent back to the client.
 *
 * @param target - The URL of the upstream service discovery endpoint.
 * @param generateRoutes - Callback that processes the discovery response and
 *   returns the client payload and the API routes to register.
 * @param args - Optional configuration.
 * @param args.route - Route path where the discovery proxy is mounted.
 *   Defaults to {@link DEFAULT_VALUES.SERVICES_PATH}.
 * @param args.apiRoute - Base path prepended to generated API routes.
 *   Defaults to {@link DEFAULT_VALUES.API_PATH}.
 * @param args.proxyOptions - Extra `http-proxy` options merged into the
 *   generated proxy configuration.
 * @param args.logger - Logger for proxy diagnostics.
 * @returns An {@link ApiProxyHandler} with `route`, `routes`, `createProxyOptions`,
 *   and a cache `middleware`.
 *
 * @example
 * ```ts
 * import { createProxyHandler } from '@equinor/fusion-framework-vite-plugin-api-service';
 *
 * const handler = createProxyHandler(
 *   'https://discovery.example.com/services',
 *   (services, { route }) => {
 *     const routes = services.map((svc) => ({
 *       match: `${route}/${svc.name}/:path*`,
 *       proxy: { target: svc.url, rewrite: (p) => p.replace(`${route}/${svc.name}`, '') },
 *     }));
 *     return { data: services, routes };
 *   },
 * );
 * ```
 */
export function createProxyHandler<
  TResponse extends JsonData,
  TResult extends JsonData = TResponse,
>(
  target: string,
  generateRoutes: ApiDataProcessor<TResponse, TResult>,
  args?: {
    route?: string;
    apiRoute?: string;
    proxyOptions?: Omit<
      ApiProxyHandler['createProxyOptions'] | ReturnType<ApiProxyHandler['createProxyOptions']>,
      'target' | 'transformResponse' | 'selfHandleResponse'
    >;
    logger?: PluginLogger;
  },
): ApiProxyHandler {
  const {
    route = DEFAULT_VALUES.SERVICES_PATH,
    apiRoute = DEFAULT_VALUES.API_PATH,
    proxyOptions = {},
    logger,
  } = args ?? {};

  // Raw upstream payload on success, status code on failure
  const cache = new Map<string, { expiresAt: number; data?: TResponse; status?: number }>();

  /**
   * Stores a cache entry and drops expired ones, so entries for keys that are never requested
   * again (for example an expired token) are reclaimed and the map only holds live entries.
   *
   * @param key - Cache key from {@link cacheKey}.
   * @param entry - Payload or failure status with its expiry time.
   */
  const remember = (
    key: string,
    entry: { expiresAt: number; data?: TResponse; status?: number },
  ): void => {
    const now = Date.now();
    // Prune on write; reads already ignore expired entries
    for (const [existingKey, existing] of cache) {
      // Only expired entries are removed; live ones must keep serving
      if (existing.expiresAt <= now) {
        cache.delete(existingKey);
      }
    }
    cache.set(key, entry);
  };

  // Initialize routes - this will be updated on each response
  let apiRoutes: ApiRoute[] | undefined;

  /**
   * Transforms a raw discovery payload for the current request and refreshes the route table.
   *
   * @param data - Raw service discovery payload (fresh from upstream or from the cache).
   * @param req - Request whose context (for example `referer`) drives the transformation.
   * @returns The transformed payload to send to the client.
   */
  const transform = (data: TResponse, req: Connect.IncomingMessage): TResult => {
    const { data: transformedData, routes } = generateRoutes(data, {
      route: apiRoute,
      request: req,
    });
    apiRoutes = routes;
    return transformedData;
  };

  /**
   * Serves service discovery requests from the cache, falling through to the proxy on a miss.
   *
   * @param req - Incoming request mounted at the discovery route.
   * @param res - Server response.
   * @param next - Continues to Vite's proxy on a cache miss.
   */
  const middleware = (
    req: IncomingRequest,
    res: ServerResponse,
    next: Connect.NextFunction,
  ): void => {
    // Never let a mock token reach a real discovery service, cached or not
    if (blockMockTokenUpstream(req, res, target, logger)) {
      return;
    }
    const key = cacheKey(req);
    const entry = key ? cache.get(key) : undefined;
    // Miss or expired: continue to Vite's proxy, which refreshes the cache from upstream
    if (!entry || entry.expiresAt <= Date.now()) {
      next();
      return;
    }
    // Successful payloads are re-transformed so request-dependent URIs match this caller
    if (entry.data !== undefined) {
      res.writeHead(200, { 'content-type': 'application/json', 'x-fusion-discovery-cache': 'hit' });
      res.end(JSON.stringify(transform(entry.data, req)));
      return;
    }
    res.writeHead(entry.status ?? 502, { 'x-fusion-discovery-cache': 'hit' });
    res.end();
  };

  return {
    get route() {
      return route;
    },
    get routes() {
      return apiRoutes || [];
    },
    middleware,
    createProxyOptions: (...args) => {
      // Resolve the provided options
      const providedOptions =
        typeof proxyOptions === 'function' ? proxyOptions(...args) : proxyOptions;

      // Configure the proxy server
      const configure = (proxyServer: ProxyServer) => {
        proxyServer.on('proxyRes', (proxyRes, req, res) => {
          const key = cacheKey(req);
          const status = proxyRes.statusCode ?? 500;
          // Remember failures so reload loops do not hit upstream again for a while
          if (key && status >= 400) {
            remember(key, { status, expiresAt: Date.now() + FAILURE_TTL_MS });
            logger?.warn(
              `service discovery responded ${status}; replaying it for ${FAILURE_TTL_MS}ms`,
            );
          }
          // initialize the interceptor since the `generateRoutes` requires the request
          const interceptor = createResponseInterceptor(
            (data: TResponse) => {
              // Store the raw payload; the transformation depends on each request
              if (key) {
                remember(key, { data, expiresAt: Date.now() + SUCCESS_TTL_MS });
              }
              return transform(data, req);
            },
            {
              logger,
            },
          );
          // execute the interceptor
          interceptor(proxyRes, req, res);
        });
        proxyServer.on('proxyReq', (proxyReq, req: IncomingRequest) => {
          logger?.info(
            `Proxying ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`,
          );
        });
        proxyServer.on('error', (err) => {
          logger?.error(`proxy for ${apiRoute} to ${target} failed: ${err.message}`);
        });
      };

      return {
        target,
        // default options
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',
        rewrite: (path) => path.replace(new RegExp(`^${route}`), ''),

        // provided options
        ...providedOptions,

        // custom options - required for response transformation
        selfHandleResponse: true,
        configure,
      };
    },
  };
}
