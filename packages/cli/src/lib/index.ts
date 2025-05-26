export type { RuntimeEnv } from './types.js';

export type { ResolvedPackage } from './utils/resolve-package.js';

export { initializeFramework, type FusionFramework } from './framework.node.js';

// Legacy imports - these will be removed in the next major version
// @todo - remove these imports, introduced in v11
export { defineAppConfig, defineAppManifest } from './legacy.js';
