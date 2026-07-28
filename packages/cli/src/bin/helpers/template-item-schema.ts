import { z } from 'zod';
import { TemplateResourceSchema } from './template-resource-schema.js';

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
