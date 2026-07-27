/**
 * Public library API for `@equinor/fusion-framework-cli`.
 *
 * Re-exports configuration helpers, dev-server utilities, and package resolution
 * functions used by consumers to configure Fusion CLI projects.
 *
 * @packageDocumentation
 */
export type { RuntimeEnv } from './types.js';

export { resolvePackage, type ResolvedPackage } from './utils/resolve-package.js';
export { resolveEntryPoint } from './utils/resolve-source-entry-point.js';

export {
  defineDevServerConfig,
  type DevServerConfigExport,
  type DevServerConfigFn,
} from './define-dev-server-config.js';
export { loadDevServerConfig } from './load-dev-server-config.js';

export {
  defineFusionCli,
  type FusionCliConfig,
  type FusionCliConfigFn,
  type FusionCliConfigExport,
} from './fusion-cli-config.js';

// Legacy imports - these will be removed in the next major version
// TODO(#5070): remove these imports, introduced in v11
export { defineAppConfig } from './legacy.js';
export { defineAppManifest } from './legacy-app-manifest.js';
