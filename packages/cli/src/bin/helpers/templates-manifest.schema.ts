import { z } from 'zod';
import { TemplateItemSchema } from './template-item.schema.js';
import { TemplateResourceSchema } from './template-resource.schema.js';

/**
 * Zod schema for the complete templates manifest.
 * Defines the structure of the templates.json file.
 */
export const TemplatesManifestSchema = z.object({
  templates: z.array(TemplateItemSchema),
  resources: z.array(TemplateResourceSchema).optional(),
});

export type TemplatesManifest = z.infer<typeof TemplatesManifestSchema>;
