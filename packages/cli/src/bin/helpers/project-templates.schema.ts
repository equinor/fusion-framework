import { z } from 'zod';

/**
 * Schema for template resource file
 */
export const TemplateResourceFileSchema = z.object({
  type: z.literal('file'),
  path: z.string(),
  target: z.string().optional(),
});

/**
 * Schema for template resource directory
 */
export const TemplateResourceDirSchema = z.object({
  type: z.literal('dir'),
  path: z.string(),
  target: z.string().optional(),
  recursive: z.boolean().optional(),
});

/**
 * Union schema for template resources
 */
export const TemplateResourceSchema = z.discriminatedUnion('type', [
  TemplateResourceFileSchema,
  TemplateResourceDirSchema,
]);

/**
 * Schema for a single template item
 */
export const TemplateItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  resources: z.array(TemplateResourceSchema),
});

/**
 * Schema for the complete templates manifest
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
 * Validates and parses template manifest JSON
 * @param jsonString - The JSON string to validate
 * @returns Parsed and validated template manifest
 * @throws ZodError if validation fails
 */
export function parseTemplatesManifest(jsonString: string): TemplatesManifest {
  try {
    const parsed = JSON.parse(jsonString);
    return TemplatesManifestSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Template manifest validation failed: ${error.message}`);
    }
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
