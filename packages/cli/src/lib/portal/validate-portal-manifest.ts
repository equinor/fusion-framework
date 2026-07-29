import { PortalManifestSchema } from './portal-manifest-schema.js';
import type { PortalManifestSchemaType } from './portal-manifest-schema.js';

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
