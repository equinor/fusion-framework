import httpProxy from 'http-proxy';

import type {
  ApiRoute,
  ServerListener,
  PluginLogger,
  ProxyListener,
  IncomingRequest,
} from './types.js';
import { createRouteMatcher } from './create-route-matcher.js';
import { InvalidRouteError, validateRoute } from './validate-route.js';
import { createResponseInterceptor } from './create-response-interceptor.js';

/**
 * Options for {@link processRoutes} and the internal `processesRoute` helper.
 *
 * @property logger - Optional {@link PluginLogger} for diagnostic messages.
 * @property onProxyRes - Optional listener invoked on every proxy response,
 *   useful for custom header injection or logging.
 */
export type ProcessRouteOptions = {
  logger?: PluginLogger;
  onProxyRes?: ProxyListener;
};

/**
 * Processes an API route by validating it, handling middleware, and optionally
 * setting up a proxy server for the route.
 *
 * @param route - The API route configuration object.
 * @param args - The parameters passed to the server listener, typically including
 *               the request (`req`), response (`res`), and next middleware function (`next`).
 * @param options - Optional configuration for the processing, including:
 *   - `logger`: A logger instance for logging debug, warning, and error messages.
 *   - `onProxyRes`: A callback for handling proxy response events.
 *
 * @throws {InvalidRouteError} If the request URL is missing or the route validation fails.
 *
 * @remarks
 * - Validates the route to ensure it has the required structure.
 * - If the route has a `middleware` function defined, it will be executed instead of setting up a proxy.
 * - If both `middleware` and `proxy` are defined, the `middleware` takes precedence.
 * - If the route has a `proxy` configuration, a proxy server is created and configured.
 * - The `proxy.configure` method, if provided, is called to allow additional customization of the proxy server.
 * - Logs debug, warning, and error messages using the provided logger, if available.
 */
function processesRoute(
  route: ApiRoute,
  args: Parameters<ServerListener>,
  options?: ProcessRouteOptions,
): void {
  const { logger } = options ?? {};
  const [req, res, next] = args;

  try {
    validateRoute(route);
  } catch (error) {
    logger?.error((error as Error).message);
    next(error);
    return;
  }

  const requestUrl = req.url;
  if (!requestUrl) {
    next(new InvalidRouteError('missing request url'));
    return;
  }

  // if route has middleware, execute it
  if (route.middleware) {
    logger?.info(`executing route middleware on match ${route.match} -> ${req.originalUrl}`);
    if (route.proxy) {
      logger?.warn('route.middleware and route.proxy are both defined. Using middleware');
    }
    route.middleware(req, res, next);
    return;
  }

  const { configure, rewrite, transformResponse, ...proxyOptions } = route.proxy;

  if (rewrite) {
    req.url = rewrite(req.url ?? '');
  }

  const proxyServer = httpProxy.createProxyServer({
    selfHandleResponse: !!transformResponse,
    prependPath: true,
    secure: process.env.NODE_ENV === 'production',
    changeOrigin: true,
    ...proxyOptions,
  });

  proxyServer.on('error', (err) => {
    logger?.error(`proxy for ${requestUrl} to ${proxyOptions.target} failed: ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Proxy error: ${err.message}`);
  });

  proxyServer.on('proxyReq', (proxyReq, req: IncomingRequest) => {
    // Set the original request URL
    logger?.info(
      `Proxying ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`,
    );
  });

  proxyServer.on('proxyRes', (proxyRes, req: IncomingRequest) => {
    const { headers, statusMessage, statusCode = 500 } = proxyRes;
    const message = `Received response for ${req.originalUrl} -> ${statusCode} ${statusMessage}`;

    res.writeHead(statusCode, {
      ...headers,
      'x-proxy-rewrite-target': proxyOptions.target,
    });

    if (statusCode ?? 0 >= 400) {
      logger?.error(message);
      logger?.debug({
        request: {
          url: req.originalUrl,
          headers: req.headers,
        },
        response: {
          statusCode,
          statusMessage,
          headers,
        },
      });
    } else {
      logger?.debug(message);
    }
  });

  if (options?.onProxyRes) {
    logger?.debug('adding custom onProxyRes handler');
    proxyServer.on('proxyRes', options.onProxyRes);
  }

  if (transformResponse) {
    logger?.debug('adding response interceptor');
    proxyServer.on('proxyRes', createResponseInterceptor(transformResponse, { logger }));
  }

  // if provided route has configure method, call it
  if (configure) {
    logger?.debug('configuring proxy server');
    configure(proxyServer, proxyOptions);
  }

  proxyServer.web(req, res);
}

/**
 * Iterates over a list of {@link ApiRoute} definitions, matches the incoming
 * request URL against each route using {@link createRouteMatcher}, and
 * processes the first matching route.
 *
 * If a route matches, its extracted path parameters are attached to
 * `req.params` and the route is handed off to `processesRoute` for
 * middleware execution or proxy forwarding.  When no route matches, the
 * `next` callback is invoked so the Vite/Connect middleware chain can
 * continue.
 *
 * @param routes - Ordered array of API routes to evaluate.
 * @param middlewareArgs - The Connect middleware triple `[req, res, next]`.
 * @param options - Optional processing configuration (logger, proxy
 *   response listener).
 */
export function processRoutes(
  routes: ApiRoute[],
  middlewareArgs: Parameters<ServerListener>,
  options?: ProcessRouteOptions,
): void {
  const [req, _res, next] = middlewareArgs;

  for (const route of routes) {
    if (!req.url) continue;
    // Extract pathname only (exclude query parameters/CGI)
    const pathname = req.url.split('?')[0];
    const match = createRouteMatcher(route)(pathname, req);
    if (match) {
      const [req, res, next] = middlewareArgs;
      req.params = typeof match === 'object' ? match.params : {};
      processesRoute(route, [req, res, next], options);
      return;
    }
  }
  // no route matched, continue middleware chain
  next();
}
