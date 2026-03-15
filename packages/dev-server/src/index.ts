/**
 * @packageDocumentation
 *
 * Development server for Fusion Framework applications.
 *
 * Provides a pre-configured Vite dev server with integrated service discovery proxying,
 * SPA template environment injection, and React HMR support. Use this package when you
 * need a local development environment that mirrors production Fusion portal behaviour.
 *
 * @remarks
 * Main entry points:
 * - {@link createDevServer} — create and start a fully configured Vite dev server
 * - {@link createDevServerConfig} — build a Vite `UserConfig` without starting the server
 * - {@link processServices} — remap Fusion service URIs to local proxy routes
 *
 * @example
 * ```typescript
 * import { createDevServer } from '@equinor/fusion-framework-dev-server';
 *
 * const server = await createDevServer({
 *   api: { serviceDiscoveryUrl: 'https://discovery.example.com' },
 * });
 * await server.listen();
 * server.printUrls();
 * ```
 */

/** Re-export of Vite's {@link import('vite').UserConfig | UserConfig} for consumer convenience when passing overrides. */
export type { UserConfig } from 'vite';

export { processServices } from './process-services.js';

export { default, createDevServer } from './create-dev-server.js';

export { createDevServerConfig } from './create-dev-server-config.js';

/** Re-export of the SPA template environment type used to configure portal, MSAL, and service discovery settings. */
export type { FusionTemplateEnv } from '@equinor/fusion-framework-vite-plugin-spa';

export * from './types.js';
