/**
 * Application manifest and configuration utilities for `@equinor/fusion-framework-cli/app`.
 *
 * Provides helpers for defining, loading, merging, and validating Fusion application
 * manifests and configurations.
 *
 * @packageDocumentation
 */
export {
  defineAppManifest,
  type AppManifestFn,
  type AppManifest,
} from './define-app-manifest.js';
export type { RouteSchemaEntry } from '@equinor/fusion-framework-module-app';
export { createAppManifestFromPackage } from './create-app-manifest-from-package.js';
export { mergeAppManifests } from './merge-app-manifests.js';
export { loadAppManifest, type AppManifestExport } from './load-app-manifest.js';
export { mergeAppConfig } from './merge-app-config.js';

export { defineAppConfig, type AppConfigFn, type AppConfig } from './define-app-config.js';
export { loadAppConfig, type AppConfigExport } from './load-app-config.js';

export { ApiAppConfigSchema, type ApiAppConfig } from './api-app-config-schema.js';
