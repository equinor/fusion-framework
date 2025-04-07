import type { ClientRequest, IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

/**
 * Preserce token for executing proxy assets
 *
 * @remarks
 * This assumes the client will execute a api call using bearer token before
 * acquiring a asset. By default the Framework will execute a rest call to load
 * application manufest for resolving build assets to import
 *
 * @remarks
 * This is a quick and dirty method to authorize requests without bearer token
 * like browser `import`.
 * The correct way would be to have a auth controller within the dev-server,
 * but since the token is only exposed to the plugin and the cli is a tool for
 * local development, this should be sufficient.
 */
let __HELP_API_TOKEN__ = '';

/**
 * Options for configuring the Help Proxy Plugin.
 */
export type HelpProxyPluginOptions = {
  /** Configuration for the proxy. */
  proxy: {
    /** The path to be proxyed. */
    path: string;
    /** The target URL for the proxy. */
    target: string;
    /** Optional callback function to modify the proxy request. */
    onProxyReq?: (proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse) => void;
  };
};

/**
 * The `helpProxyPlugin` function creates a Vite plugin that configures a proxy
 * for assets API requests to the Fusion Help Service.
 *
 * @param {HelpProxyPluginOptions} options - The options for configuring the help proxy plugin.
 *
 * @returns {Plugin} - The configured Vite plugin.
 *
 * @example
 * ```typescript
 * const plugin = helpProxyPlugin({
 *   proxy: {
 *     path: '/help-proxy',
 *     target: 'https://help.ci.api.fusion-dev.net',
 *     onProxyReq: (proxyReq, req, res) => {
 *       proxyReq.on('response', (res) => { console.log(res.statusCode) });
 *     },
 *   },
 * });
 *
 * // Fetch a resource through the proxy
 * fetch('/help-proxy/assets/resources/images/image.jpg');
 * ```
 */
export const helpProxyPlugin = (options: HelpProxyPluginOptions): Plugin => {
  const {
    proxy: { onProxyReq = () => void 0, path: proxyPath, target },
  } = options;

  return {
    name: 'fusion:help-proxy',
    apply: 'serve',
    config(config) {
      config.server ??= {};
      config.server.proxy ??= {};
      config.server.proxy[proxyPath] = {
        target,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(proxyPath, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (__HELP_API_TOKEN__) {
              // apply token to proxy request
              proxyReq.setHeader('authorization', __HELP_API_TOKEN__);
            }
          });
          proxy.on('proxyReq', onProxyReq);
        },
      };
    },
    configureServer(server) {
      server.middlewares.use(proxyPath, async (req, res, next) => {
        if (req.headers.authorization) {
          __HELP_API_TOKEN__ = req.headers.authorization || '';
          res.end();
          return;
        }
        next();
      });
    },
  };
};

export default helpProxyPlugin;
