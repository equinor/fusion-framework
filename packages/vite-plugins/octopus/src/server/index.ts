/**
 * Octopus server: a local registry and proxy for portal development, without a Vite dependency.
 *
 * App dev servers register where they run. A portal dev server loads registered apps from
 * there, and every other app from CI. Use {@link startOctopus} to run it, e.g. from `ffc octopus`.
 *
 * @packageDocumentation
 */

/** Default Octopus address. */
export const DEFAULT_OCTOPUS_URL = 'http://localhost:2000';

export { renderPage } from './page.js';
export { parseLocalUrl, type RegisteredApp, type Registration, Registry } from './registry.js';
export { type AppRequest, parseAppRequest } from './routes.js';
export {
  createOctopusServer,
  type HealthCheckOptions,
  isReachable,
  OCTOPUS_HEADER,
  OCTOPUS_REGISTRY,
  OCTOPUS_MOCK_HEADER,
  type OctopusServerOptions,
  PROXY_PREFIX,
  type RegistryEvent,
  startHealthChecks,
} from './server.js';
export { describeEvent, type RunningOctopus, startOctopus } from './start.js';
