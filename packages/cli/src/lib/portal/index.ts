/**
 * Portal manifest, configuration, and schema utilities for `@equinor/fusion-framework-cli/portal`.
 *
 * Provides helpers for defining, loading, merging, and validating Fusion portal
 * manifests, configurations, and schemas.
 *
 * @packageDocumentation
 */
export {
  createPortalManifestFromPackage,
  definePortalManifest,
  loadPortalManifest,
  validatePortalManifest,
  type PortalManifest,
  type PortalManifestExport,
  type PortalManifestFn,
} from './define-portal-manifest.js';

export {
  definePortalSchema,
  type PortalSchema,
  type PortalSchemaExport,
  type PortalSchemaFn,
} from './define-portal-schema.js';
export { loadPortalSchema } from './load-portal-schema.js';

export {
  definePortalConfig,
  type PortalConfig,
  type PortalConfigFn,
} from './define-portal-config.js';

export {
  loadPortalConfig,
  type PortalConfigExport,
} from './load-portal-config.js';
