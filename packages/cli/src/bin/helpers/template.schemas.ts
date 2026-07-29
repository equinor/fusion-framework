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
 * Type definitions derived from schemas
 */
export type TemplateResourceFile = z.infer<typeof TemplateResourceFileSchema>;

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

export type TemplateResourceDir = z.infer<typeof TemplateResourceDirSchema>;

/**
 * Union schema for all template resource types.
 * Supports both file and directory resources with discriminated union.
 */
export const TemplateResourceSchema = z.discriminatedUnion('type', [
  TemplateResourceFileSchema,
  TemplateResourceDirSchema,
]);

export type TemplateResource = z.infer<typeof TemplateResourceSchema>;

/**
 * Zod schema for a single template item.
 * Defines the structure of individual project templates.
 */
export const TemplateItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  resources: z.array(TemplateResourceSchema),
});

export type TemplateItem = z.infer<typeof TemplateItemSchema>;

/**
 * Zod schema for the complete templates manifest.
 * Defines the structure of the templates.json file.
 */
export const TemplatesManifestSchema = z.object({
  templates: z.array(TemplateItemSchema),
  resources: z.array(TemplateResourceSchema).optional(),
});

export type TemplatesManifest = z.infer<typeof TemplatesManifestSchema>;
