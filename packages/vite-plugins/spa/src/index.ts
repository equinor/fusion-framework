/**
 * @module @equinor/fusion-framework-vite-plugin-spa
 *
 * Vite plugin for building Fusion Framework Single Page Applications (SPAs).
 *
 * Provides HTML template generation, MSAL authentication bootstrapping,
 * service discovery wiring, portal loading, and authenticated API proxying
 * via a service worker.
 *
 * @remarks
 * This plugin is intended for non-production development environments and
 * is designed for use with `@equinor/fusion-framework-cli`.
 *
 * @example
 * ```ts
 * import { fusionSpaPlugin } from '@equinor/fusion-framework-vite-plugin-spa';
 *
 * export default defineConfig({
 *   plugins: [
 *     fusionSpaPlugin({
 *       generateTemplateEnv: () => ({
 *         title: 'My App',
 *         portal: { id: 'my-portal' },
 *         serviceDiscovery: { url: 'https://...', scopes: ['api://...'] },
 *         msal: { tenantId: '...', clientId: '...', redirectUri: '...' },
 *       }),
 *     }),
 *   ],
 * });
 * ```
 */
export { default, plugin as fusionSpaPlugin, type PluginOptions } from './plugin.js';

export * from './types.js';
