import type { Plugin } from 'vite';

import { type ProcessRouteOptions, processRoutes } from './process-route';

import type { ApiProxyHandler, ApiRoute } from './types';

const pluginName = 'fusion:dev_server::api-proxy';

// Define PluginArguments with stricter type checking
export type PluginArguments = {
  proxyHandler?: ApiProxyHandler;
  routes?: ApiRoute[];
} & (
  | { proxyHandler: ApiProxyHandler; routes?: ApiRoute[] }
  | { routes: ApiRoute[]; proxyHandler?: ApiProxyHandler }
);

/**
 * Configuration options for the API service plugin.
 */
export type PluginOptions = {
  /**
   * base router path for the plugin middleware
   * @default '/@api-proxy'
   */
  route?: string;
  /**
   * options for processing the routes
   */
  process?: ProcessRouteOptions;
};

/**
 * Creates a Vite plugin for handling API proxying and custom routes.
 *
 * This plugin allows you to define custom API routes or proxy handlers that
 * can be used during development. It integrates with Vite's server configuration
 * to set up middleware for handling API requests.
 *
 * @param args - The arguments for the plugin.
 * @param args.routes - An optional array of route definitions to handle API requests.
 * @param args.proxyHandler - An optional proxy handler for forwarding API requests.
 *
 * @param options - The options for the plugin.
 * @param options.route - The base route for the API proxy. Defaults to `'/@api-proxy'`.
 * @param options.process - An optional function to process requests and responses.
 *
 * @returns A Vite plugin object that satisfies the `Plugin` interface.
 *
 * @throws {Error} If neither `routes` nor `proxyHandler` is provided in `args`.
 */
export function plugin(args: PluginArguments, options?: PluginOptions): Plugin {
  const { routes, proxyHandler } = args;

  const logger = options?.process?.logger;

  // Plugin requires either routes or/and proxyHandler
  if (!args.routes && !args.proxyHandler) {
    throw new Error('No routes or proxy handler provided');
  }

  const proxyBase = options?.route ?? '/@api-proxy';

  logger?.debug(pluginName, `Setting up API proxy at ${proxyBase}`);

  return {
    name: 'fusion:api-proxy',
    config(config, env) {
      if (proxyHandler) {
        config.server ??= {};
        const proxyOptions = proxyHandler.createProxyOptions(config, env);
        config.server.proxy = Object.assign({}, config.server.proxy, {
          [proxyHandler.route]: proxyOptions,
        });
        logger?.debug(
          pluginName,
          `Proxying API requests for ${proxyHandler.route} to ${proxyOptions.target}`,
        );
      }
    },
    configureServer(server) {
      // first handle provided routes
      if (routes) {
        server.middlewares.use(proxyBase, async (req, res, next) => {
          processRoutes(routes, [req, res, next], options?.process);
        });
        logger?.debug(pluginName, `Added custom routes [${routes.length}] at ${proxyBase}`);
      }

      // then handle proxy handler routes
      if (proxyHandler) {
        server.middlewares.use(proxyBase, async (req, res, next) => {
          processRoutes(proxyHandler.routes, [req, res, next], options?.process);
        });
      }
    },
  } satisfies Plugin;
}

export default plugin;
