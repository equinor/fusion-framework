import { z } from 'zod';

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
