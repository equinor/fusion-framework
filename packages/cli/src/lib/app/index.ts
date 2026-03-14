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
  type AppManifestWithRoutes,
} from './app-manifest.js';
export type { RouteSchemaEntry } from '@equinor/fusion-framework-module-app';
export { createAppManifestFromPackage } from './create-app-manifest.js';
export { mergeAppManifests } from './merge-app-manifest.js';
export { loadAppManifest, type AppManifestExport } from './load-app-manifest.js';
export { mergeAppConfig } from './merge-app-config.js';

export { defineAppConfig, type AppConfigFn, type AppConfig } from './app-config.js';
export { loadAppConfig, type AppConfigExport } from './load-app-config.js';

export { ApiAppConfigSchema, type ApiAppConfig } from './schemas.js';
