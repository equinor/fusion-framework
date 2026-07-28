import { z } from 'zod';
import { TemplateResourceFileSchema } from './template-resource-file-schema.js';
import { TemplateResourceDirSchema } from './template-resource-dir-schema.js';

/**
 * Union schema for all template resource types.
 * Supports both file and directory resources with discriminated union.
 */
export const TemplateResourceSchema = z.discriminatedUnion('type', [
  TemplateResourceFileSchema,
  TemplateResourceDirSchema,
]);

export type TemplateResource = z.infer<typeof TemplateResourceSchema>;
