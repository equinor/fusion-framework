import type { Plugin } from 'vite';

import { type ProcessRouteOptions, processRoutes } from './process-route.js';

import type { ApiProxyHandler, ApiRoute, PluginLogger } from './types.js';
import { DEFAULT_VALUES } from './constants.js';

const pluginName = 'fusion:dev_server::api-proxy';

/**
 * Arguments accepted by the {@link plugin} factory.
 *
 * At least one of `proxyHandler` or `routes` must be provided.
 * Supply `proxyHandler` to enable service discovery proxying, and/or
 * `routes` to register custom middleware or proxy route definitions.
 */
export type PluginArguments = {
  /** Proxy handler created via {@link createProxyHandler} for service discovery. */
  proxyHandler?: ApiProxyHandler;
  /** Custom API route definitions (middleware or proxy). */
  routes?: ApiRoute[];
} & (
  | { proxyHandler: ApiProxyHandler; routes?: ApiRoute[] }
  | { routes: ApiRoute[]; proxyHandler?: ApiProxyHandler }
);

/**
 * Optional configuration for the API service plugin.
 *
 * Controls the base middleware path, route processing behaviour, and logging.
 */
export type PluginOptions = {
  /**
   * Base router path where plugin middleware is mounted.
   * @default DEFAULT_VALUES.API_PATH ('/@fusion-api')
   */
  route?: string;
  /**
   * Additional options forwarded to {@link processRoutes} (excluding `logger`,
   * which is set via the top-level `logger` option).
   */
  process?: Omit<ProcessRouteOptions, 'logger'>;
  /**
   * Logger used for debug, info, warning, and error messages emitted by the
   * plugin. Pass `console` for quick debugging.
   */
  logger?: PluginLogger;
};

/**
 * Creates a Vite plugin that proxies API requests and serves custom routes
 * during Fusion Framework application development.
 *
 * Use this plugin to wire up service discovery proxying, define middleware
 * routes for mocked responses, or both.
 *
 * @param args - Plugin arguments specifying the routes and/or proxy handler.
 * @param args.routes - Custom {@link ApiRoute} definitions (middleware or proxy).
 * @param args.proxyHandler - A proxy handler created with {@link createProxyHandler}
 *   for service discovery integration.
 * @param options - Optional plugin configuration.
 * @param options.route - Base middleware path. Defaults to {@link DEFAULT_VALUES.API_PATH}.
 * @param options.process - Route processing options forwarded to {@link processRoutes}.
 * @param options.logger - Logger for plugin diagnostics.
 * @returns A Vite `Plugin` that configures server proxy and middleware.
 * @throws {Error} When neither `routes` nor `proxyHandler` is provided.
 *
 * @example
 * ```ts
 * import apiPlugin, { createProxyHandler } from '@equinor/fusion-framework-vite-plugin-api-service';
 *
 * export default defineConfig({
 *   plugins: [
 *     apiPlugin(
 *       {
 *         proxyHandler: createProxyHandler(
 *           'https://discovery.example.com/services',
 *           (data, { route }) => ({ data, routes: [] }),
 *         ),
 *         routes: [
 *           { match: '/mock/health', middleware: (_req, res) => { res.end('ok'); } },
 *         ],
 *       },
 *       { logger: console },
 *     ),
 *   ],
 * });
 * ```
 */
export function plugin(args: PluginArguments, options?: PluginOptions): Plugin {
  const { routes, proxyHandler } = args;

  const { logger } = options ?? {};

  // Plugin requires either routes or/and proxyHandler
  if (!args.routes && !args.proxyHandler) {
    throw new Error('No routes or proxy handler provided');
  }

  const proxyBase = options?.route ?? DEFAULT_VALUES.API_PATH;

  logger?.debug(`Setting up API proxy at ${proxyBase}`);

  return {
    name: 'fusion:api-proxy',
    config(config, env) {
      if (proxyHandler) {
        config.server ??= {};
        const proxyOptions = proxyHandler.createProxyOptions(config, env);
        config.server.proxy = Object.assign({}, config.server.proxy, {
          [proxyHandler.route]: proxyOptions,
        });
        logger?.debug(`Proxying API requests for ${proxyHandler.route} to ${proxyOptions.target}`);
      }
    },
    configureServer(server) {
      // first handle provided routes
      if (routes) {
        server.middlewares.use(proxyBase, async (req, res, next) => {
          processRoutes(routes, [req, res, next], { ...options?.process, logger });
        });
        logger?.debug(`Added custom routes [${routes.length}] at ${proxyBase}`);
      }

      // then handle proxy handler routes
      if (proxyHandler) {
        server.middlewares.use(proxyBase, async (req, res, next) => {
          logger?.debug(`Processing proxy routes [${proxyHandler.routes.length}] at ${proxyBase}`);
          processRoutes(proxyHandler.routes, [req, res, next], { ...options?.process, logger });
        });
      }
    },
  } satisfies Plugin;
}

export default plugin;
