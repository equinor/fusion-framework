/**
 * Vite plugins that let a local Fusion portal load apps from their local dev servers.
 *
 * - {@link octopusAppPlugin}, for an app dev server: registers the app with Octopus while it runs.
 * - {@link octopusPortalPlugin}, for a portal dev server: loads registered apps from their dev
 *   server, every other app from CI, and starts Octopus when it is not running.
 *
 * The Octopus server itself is in `@equinor/fusion-framework-vite-plugin-octopus/server`.
 *
 * @example
 * ```ts
 * // App dev server
 * octopusAppPlugin({ appKey: 'my-app', octopusUrl: 'http://localhost:2000' });
 *
 * // Portal dev server
 * octopusPortalPlugin({ octopusUrl: 'http://localhost:2000' });
 * ```
 *
 * @packageDocumentation
 */

export { DEFAULT_OCTOPUS_URL } from './server/index.js';
export { isLocalOrigin, octopusAppPlugin, type OctopusAppPluginOptions } from './app-plugin.js';
export {
  APP_KEY_HEADER,
  APP_SOURCE_PATH,
  type AppSource,
  createAppRequestHandler,
  createAppSourceHandler,
  createMockApiHandler,
  type EnsureOctopusState,
  ensureOctopus,
  type OctopusPortalPluginOptions,
  type OctopusStatus,
  octopusPortalPlugin,
  type RequestHandler,
} from './portal-plugin.js';
