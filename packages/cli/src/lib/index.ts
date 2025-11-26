export type { RuntimeEnv } from './types.js';

export { resolvePackage, type ResolvedPackage } from './utils/resolve-package.js';
export { resolveEntryPoint } from './utils/resolve-source-entry-point.js';

export {
  loadDevServerConfig,
  defineDevServerConfig,
  type DevServerConfigExport,
  type DevServerConfigFn,
} from './load-dev-server-config.js';

export {
  defineFusionCli,
  type FusionCliConfig,
  type FusionCliConfigFn,
  type FusionCliConfigExport,
} from './fusion-cli-config.js';

// Legacy imports - these will be removed in the next major version
// @todo - remove these imports, introduced in v11
export { defineAppConfig, defineAppManifest } from './legacy.js';
