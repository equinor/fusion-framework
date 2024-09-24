import { Plugin } from 'vite';

import { AppConfig, AppManifest } from '@equinor/fusion-framework-app';
import { ClientRequest, IncomingMessage, ServerResponse } from 'node:http';

/**
 * Preserve token for executing proxy assets
 *
 * @remarks
 * This assumes the client will execute a api call using bearer token before
 * acquiring a asset. By default the Framework will execute a rest call to load
 * application manifest for resolving build assets to import.
 *
 * @remarks
 * This is a quick and dirty method to authorize requests without bearer token
 * like browser `import`.
 * The correct way would be to have a auth controller within the dev-server,
 * but since the token is only exposed to the plugin and the cli is a tool for local
 * development, this should be sufficient.
 */
let __APP_API_TOKEN__ = '';

/**
 * Options for configuring the App Proxy Plugin.
 *
 * @remarks
 * When not providing an app configuration, the plugin will only proxy requests to the target.
 */
export type AppProxyPluginOptions = {
    /** Configuration for the proxy. */
    proxy: {
        /** The path to be proxied. */
        path: string;
        /** The target URL for the proxy. */
        target: string;
        /** Optional callback function to modify the proxy request. */
        onProxyReq?: (proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse) => void;
    };
    /** Optional configuration for the app. */
    app?: {
        /** application key */
        key: string;
        /** application version */
        version: string;
        /** callback function for generating configuration for the application */
        generateConfig: () => Promise<AppConfig>;
        /** callback function for generating manifest for the application */
        generateManifest: () => Promise<AppManifest>;
    };
};

/**
 * The `appProxyPlugin` function creates a Vite plugin that configures a proxy for API and bundle requests
 * to the Fusion apps backend. It also serves the app manifest, config, and local bundles if an app is provided.
 *
 * @param {AppProxyPluginOptions} options - The options for configuring the app proxy plugin.
 *
 * @returns {Plugin} - The configured Vite plugin.
 *
 * @example
 * ```typescript
 * const plugin = appProxyPlugin({
 *   proxy: {
 *     path: '/app-proxy',
 *     target: 'https://fusion-s-apps-ci.azurewebsites.net/',
 *     onProxyReq: (proxyReq, req, res) => {
 *       proxyReq.on('response', (res) => { console.log(res.statusCode) });
 *     },
 *   },
 *   app: {
 *     key: 'my-app',
 *     version: '1.0.0',
 *     generateConfig: async () => ({}),
 *     generateManifest: async () => ({}),
 *   },
 * });
 *
 * // api calls
 * fetch('/app-proxy/apps/my-app/builds/1.0.0/config'); // will generate app config by provided function
 * fetch('/app-proxy/apps/my-app/builds/0.0.9/config'); // will proxy to the target, since version does not match
 * fetch('/app-proxy/apps/other-app/builds/1.0.0/config'); // will proxy to the target, since app key does not match
 *
 * // asset calls
 * fetch('/app-proxy/bundles/my-app/builds/1.0.0/index.js'); // will generate bundle by provided function
 * fetch('/app-proxy/bundles/my-app/builds/0.0.9/index.js'); // will proxy to the target, since version does not match
 * ```
 *
 */
export const appProxyPlugin = (options: AppProxyPluginOptions): Plugin => {
    const {
        proxy: { onProxyReq = () => void 0, path: proxyPath, target },
    } = options;
    return {
        name: 'fusion:app-proxy',
        apply: 'serve',
        config(config) {
            config.server ??= {};
            config.server.proxy = {
                // proxy all api calls to the fusion apps backend
                [proxyPath]: {
                    target,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(proxyPath, ''),
                    configure: (proxy) => {
                        proxy.on('proxyReq', (proxyReq) => {
                            const token = proxyReq.getHeader('authorization');
                            // preserve token for executing proxy assets
                            if (typeof token === 'string') {
                                __APP_API_TOKEN__ = token;
                            // apply token to proxy request
                            } else if (__APP_API_TOKEN__) {
                                proxyReq.setHeader('authorization', __APP_API_TOKEN__);
                            }
                        });
                        proxy.on('proxyReq', onProxyReq);
                    },
                },
            };
        },
        configureServer(server) {
            const { app } = options;

            // disable local assets if no app configuration provided
            if (!app) return;

            // serve app manifest if request matches the current app
            // todo this should have version
            const manifestPath = `${proxyPath}/apps/${app.key}`;
            server.middlewares.use(manifestPath, async (_req, res) => {
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify(await app.generateManifest()));
            });

            // serve app config if request matches the current app and version
            const configPath = `${proxyPath}/apps/${app.key}/builds/${app.version}/config`;
            server.middlewares.use(configPath, async (_req, res) => {
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify(await app.generateConfig()));
            });

            // serve local bundles if request matches the current app and version
            const bundlePath = `${proxyPath}/bundles/apps/${app.key}/${app.version}`;
            server.middlewares.use(async (req, _res, next) => {
                if (req.url?.match(bundlePath)) {
                    // remove proxy path from url
                    req.url = req.url!.replace(bundlePath, '');
                }
                next();
            });
        },
    };
};

export default appProxyPlugin;
