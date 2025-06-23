import { z } from 'zod';
/**
 * Zod schema for validating the build section of the PortalManifest object.
 *
 * This schema defines the structure and types for the build metadata used in the portal manifest.
 *
 * @remarks
 * - Maintainers: Update this schema if the build contract changes.
 * - This schema is the canonical source for portal build validation and structure.
 */
export const PortalManifestBuildSchema = z.object({
  // Main entry point for the portal (required)
  templateEntry: z
    .string({
      required_error: 'templateEntry is required in build section',
      invalid_type_error: 'templateEntry must be a string',
    })
    .describe('Main entry point for the portal'),
  // Schema file for portal validation (required)
  schemaEntry: z
    .string({
      required_error: 'schemaEntry is required in build section',
      invalid_type_error: 'schemaEntry must be a string',
    })
    .describe('Schema file for portal validation'),
  // Asset path for dev/preview builds (optional)
  assetPath: z
    .string({
      invalid_type_error: 'assetPath must be a string',
    })
    .optional()
    .describe('Asset path for dev/preview builds'),
  // GitHub repo URL or local git remote (optional)
  githubRepo: z
    .string({
      invalid_type_error: 'githubRepo must be a string',
    })
    .optional()
    .describe('GitHub repo URL or local git remote'),
  // Version from package.json (required)
  version: z
    .string({
      required_error: 'version is required in build section',
      invalid_type_error: 'version must be a string',
    })
    .describe('Version from package.json'),
  // Current build timestamp (ISO8601, required)
  timestamp: z
    .string({
      required_error: 'timestamp is required in build section',
      invalid_type_error: 'timestamp must be a string',
    })
    .describe('Current build timestamp (ISO8601)'),
  // Current git commit SHA (required)
  commitSha: z
    .string({
      required_error: 'commitSha is required in build section',
      invalid_type_error: 'commitSha must be a string',
    })
    .describe('Current git commit SHA'),
  // Optional build annotations (key-value pairs)
  annotations: z
    .record(z.string(), {
      invalid_type_error: 'annotations must be a record of string values',
    })
    .optional()
    .describe('Optional build annotations'),
  // Optional project homepage
  projectPage: z
    .string({
      invalid_type_error: 'projectPage must be a string',
    })
    .optional()
    .describe('Optional project homepage'),
  // List of allowed asset extensions (with leading dot, required)
  allowedExtensions: z
    .array(
      z.string({
        invalid_type_error: 'Each allowed extension must be a string',
      }),
      {
        required_error: 'allowedExtensions is required in build section',
        invalid_type_error: 'allowedExtensions must be an array of strings',
      },
    )
    .describe('List of allowed asset extensions (with leading dot)'),
  // Optional schema for the portal (record of unknown values)
  schema: z
    .record(z.unknown(), {
      invalid_type_error: 'schema must be a record of unknown values',
    })
    .optional()
    .describe('Optional schema for the portal'),
  // Optional configuration for the portal (record of unknown values)
  config: z
    .record(z.unknown(), {
      invalid_type_error: 'config must be a record of unknown values',
    })
    .optional()
    .describe('Optional configuration for the portal'),
});

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
    .string({
      required_error: 'name is required in portal manifest',
      invalid_type_error: 'name must be a string',
    })
    .describe('Short app key (unscoped, derived from package name)'),
  // Full package name, may include scope (optional)
  displayName: z
    .string({
      invalid_type_error: 'displayName must be a string',
    })
    .optional()
    .describe('Full package name, may include scope'),
  // Description of the portal (optional)
  description: z
    .string({
      invalid_type_error: 'description must be a string',
    })
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

/**
 * Type representing the validated build section of the PortalManifest.
 *
 * This type is inferred from the build Zod schema and should be used for build-specific logic.
 */
export type PortalManifestBuildSchemaType = z.infer<typeof PortalManifestBuildSchema>;
