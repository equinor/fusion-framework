import { z } from 'zod';
import { TemplatesManifestSchema, type TemplatesManifest } from './templates-manifest.schema.js';

/**
 * Validates and parses a template manifest JSON string.
 *
 * This function takes a JSON string containing template definitions and validates
 * it against the TemplatesManifestSchema. It provides detailed error messages
 * for both JSON parsing errors and schema validation failures.
 *
 * @param jsonString - The JSON string to validate and parse
 * @returns Parsed and validated template manifest object
 * @throws {Error} If JSON parsing fails or schema validation fails
 *
 * @example
 * ```typescript
 * const manifestJson = readFileSync('templates.json', 'utf8');
 * const manifest = parseTemplatesManifest(manifestJson);
 * console.log(`Found ${manifest.templates.length} templates`);
 * ```
 */
export function parseTemplatesManifest(jsonString: string): TemplatesManifest {
  try {
    const parsed = JSON.parse(jsonString);
    return TemplatesManifestSchema.parse(parsed);
  } catch (error) {
    // Zod validation errors get a friendlier, field-specific message
    if (error instanceof z.ZodError) {
      throw new Error(`Template manifest validation failed: ${error.message}`);
    }
    throw new Error(
      `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
