import type { PortalManifestFn } from './load-portal-manifest.js';
import type { PortalManifestSchemaType } from './portal-manifest.schema.js';
import { PortalManifestSchema } from './portal-manifest.schema.js';

// Re-export relevant manifest utilities and types for external use
export {
  loadPortalManifest,
  type PortalManifestExport,
  type PortalManifestFn,
} from './load-portal-manifest.js';

export { createPortalManifestFromPackage } from './create-portal-manifest.js';

// Helper to define a typed portal manifest function
export const definePortalManifest = <T extends PortalManifestSchemaType>(fn: PortalManifestFn<T>) =>
  fn;

export {
  PortalManifestSchema,
  PortalManifestBuildSchema,
  PortalManifestSchemaType as PortalManifest,
  type PortalManifestBuildSchemaType as PortalManifestBuild,
} from './portal-manifest.schema.js';

/**
 * Validates a portal manifest object against the PortalManifestSchema.
 *
 * @param manifest - The manifest object to validate.
 * @returns The validated manifest object (typed) if valid.
 * @throws ZodError if validation fails.
 *
 * Use this utility to ensure a manifest conforms to the expected schema before further processing.
 */
export function validatePortalManifest(manifest: unknown): PortalManifestSchemaType {
  // Throws if validation fails; returns typed manifest if valid
  return PortalManifestSchema.parse(manifest);
}
