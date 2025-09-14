import { z } from 'zod';

/**
 * Zod schema for template resource files.
 * Defines the structure for individual files in a project template.
 */
export const TemplateResourceFileSchema = z.object({
  type: z.literal('file'),
  path: z.string(),
  target: z.string().optional(),
});

/**
 * Zod schema for template resource directories.
 * Defines the structure for directories in a project template.
 */
export const TemplateResourceDirSchema = z.object({
  type: z.literal('dir'),
  path: z.string(),
  target: z.string().optional(),
  recursive: z.boolean().optional(),
});

/**
 * Union schema for all template resource types.
 * Supports both file and directory resources with discriminated union.
 */
export const TemplateResourceSchema = z.discriminatedUnion('type', [
  TemplateResourceFileSchema,
  TemplateResourceDirSchema,
]);

/**
 * Zod schema for a single template item.
 * Defines the structure of individual project templates.
 */
export const TemplateItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  resources: z.array(TemplateResourceSchema),
});

/**
 * Zod schema for the complete templates manifest.
 * Defines the structure of the templates.json file.
 */
export const TemplatesManifestSchema = z.object({
  templates: z.array(TemplateItemSchema),
  resources: z.array(TemplateResourceSchema).optional(),
});

/**
 * Type definitions derived from schemas
 */
export type TemplateResourceFile = z.infer<typeof TemplateResourceFileSchema>;
export type TemplateResourceDir = z.infer<typeof TemplateResourceDirSchema>;
export type TemplateResource = z.infer<typeof TemplateResourceSchema>;
export type TemplateItem = z.infer<typeof TemplateItemSchema>;
export type TemplatesManifest = z.infer<typeof TemplatesManifestSchema>;

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
    if (error instanceof z.ZodError) {
      throw new Error(`Template manifest validation failed: ${error.message}`);
    }
    throw new Error(
      `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
