import type { PortalManifestFn } from './load-portal-manifest.js';
import type { PortalManifestSchemaType } from './portal-manifest-schema.js';

// Re-export relevant manifest utilities and types for external use
export {
  loadPortalManifest,
  type PortalManifestExport,
  type PortalManifestFn,
} from './load-portal-manifest.js';

export { createPortalManifestFromPackage } from './create-portal-manifest.js';

/**
 * Utility to define a portal manifest function with proper typing.
 *
 * This is a no-op at runtime — it returns the provided function unchanged.
 * It exists to provide type safety and editor support when authoring portal manifest files.
 *
 * @template T - The portal manifest type, extending `PortalManifestSchemaType`.
 * @param fn - A function that receives the runtime environment and base manifest, and returns manifest overrides.
 * @returns The provided function, unchanged.
 *
 * @example
 * ```ts
 * import { definePortalManifest } from '@equinor/fusion-framework-cli/portal';
 *
 * export default definePortalManifest((env, { base }) => ({
 *   ...base,
 *   name: 'my-portal',
 * }));
 * ```
 */
export const definePortalManifest = <T extends PortalManifestSchemaType>(fn: PortalManifestFn<T>) =>
  fn;

export { PortalManifestSchema, PortalManifestSchemaType as PortalManifest } from './portal-manifest-schema.js';
export {
  PortalManifestBuildSchema,
  type PortalManifestBuildSchemaType as PortalManifestBuild,
} from './portal-manifest.schema.js';

export { validatePortalManifest } from './validate-portal-manifest.js';

