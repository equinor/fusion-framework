import { z } from 'zod';

import { PortalManifestBuildSchema } from './portal-manifest-build-schema.js';

/**
 * Zod schema for validating the PortalManifest object.
 *
 * This schema defines the structure and types for the portal manifest used in the Fusion Framework CLI.
 * It ensures that the manifest adheres to expected types and provides sensible defaults for build metadata.
 *
 * @remarks
 * - Maintainers: Update this schema if the portal manifest contract changes.
 * - This schema is the canonical source for portal manifest validation and structure.
 */
export const PortalManifestSchema = z.object({
  // Short app key (unscoped, derived from package name, required)
  name: z
    .string({ message: 'name must be a string' })
    .describe('Short app key (unscoped, derived from package name)'),
  // Full package name, may include scope (optional)
  displayName: z
    .string({ message: 'displayName must be a string' })
    .optional()
    .describe('Full package name, may include scope'),
  // Description of the portal (optional)
  description: z
    .string({ message: 'description must be a string' })
    .optional()
    .describe('Description of the portal'),
  // Build section (required, validated by PortalManifestBuildSchema)
  build: PortalManifestBuildSchema,
});

/**
 * Type representing the validated PortalManifest configuration.
 *
 * This type is inferred from the Zod schema and should be used throughout the CLI
 * to ensure type safety and consistency with the schema.
 */
export type PortalManifestSchemaType = z.infer<typeof PortalManifestSchema>;
