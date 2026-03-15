import { createServer, type UserConfig } from 'vite';
import { createDevServerConfig } from './create-dev-server-config.js';

import type { DevServerOptions } from './types.js';

/**
 * Create and return a fully configured Vite development server for a Fusion Framework application.
 *
 * Combines SPA template environment injection, service discovery proxying, and React HMR into
 * a single ready-to-listen server instance. Use this function when you want the default
 * development workflow; use {@link createDevServerConfig} instead if you only need the Vite
 * configuration object without starting the server.
 *
 * @param options - Development server configuration including SPA template environment,
 *                  API proxy settings, and optional logging overrides.
 * @param overrides - Optional Vite {@link import('vite').UserConfig | UserConfig} merged on top
 *                    of the generated configuration (e.g. custom port, extra plugins).
 * @returns A promise that resolves to a Vite {@link import('vite').ViteDevServer | ViteDevServer}
 *          ready for {@link import('vite').ViteDevServer.listen | listen()} and
 *          {@link import('vite').ViteDevServer.printUrls | printUrls()}.
 *
 * @example
 * ```typescript
 * import { createDevServer } from '@equinor/fusion-framework-dev-server';
 *
 * const server = await createDevServer({
 *   spa: {
 *     templateEnv: {
 *       portal: { id: 'my-portal' },
 *       title: 'My App',
 *       serviceDiscovery: { url: 'https://discovery.example.com', scopes: [] },
 *       msal: { clientId: 'id', tenantId: 'tid', redirectUri: '/auth/callback', requiresAuth: 'true' },
 *     },
 *   },
 *   api: { serviceDiscoveryUrl: 'https://discovery.example.com' },
 * });
 *
 * await server.listen();
 * server.printUrls();
 * ```
 */
export const createDevServer = async (options: DevServerOptions, overrides?: UserConfig) => {
  const config = createDevServerConfig(options, overrides);
  const server = await createServer(config);
  return server;
};

export default createDevServer;
