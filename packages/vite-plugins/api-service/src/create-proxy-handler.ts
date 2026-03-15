import type ProxyServer from 'http-proxy';

import type {
  ApiRoute,
  JsonData,
  ApiProxyHandler,
  PluginLogger,
  IncomingRequest,
} from './types.js';
import { DEFAULT_VALUES } from './constants.js';
import { createResponseInterceptor } from './create-response-interceptor.js';
import type { Connect } from 'vite';

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
 * @returns An {@link ApiProxyHandler} with `route`, `routes`, and
 *   `createProxyOptions` members.
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

  // Initialize routes - this will be updated on each response
  let apiRoutes: ApiRoute[] | undefined;
  return {
    get route() {
      return route;
    },
    get routes() {
      return apiRoutes || [];
    },
    createProxyOptions: (...args) => {
      // Resolve the provided options
      const providedOptions =
        typeof proxyOptions === 'function' ? proxyOptions(...args) : proxyOptions;

      // Configure the proxy server
      const configure = (proxyServer: ProxyServer) => {
        proxyServer.on('proxyRes', (proxyRes, req, res) => {
          // initialize the interceptor since the `generateRoutes` requires the request
          const interceptor = createResponseInterceptor(
            (data: TResponse) => {
              const { data: transformedData, routes } = generateRoutes(data, {
                route: apiRoute,
                request: req,
              });
              apiRoutes = routes;
              return transformedData;
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
