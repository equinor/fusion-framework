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
