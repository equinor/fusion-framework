import { z } from 'zod';
import type { ContextItem } from '@equinor/fusion-framework-module-context';

// Schema representing an object with data points of a Fusion context.
// Used to parse an object with context data.
export const contextSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    title: z.string().optional(),
    externalId: z.string().optional(),
    source: z.string().optional(),
  })
  .optional()
  .nullable();

export type ContextItemType = z.infer<typeof contextSchema>;

export const extractContextMetadata = (context: ContextItem): z.input<typeof contextSchema> => {
  return {
    id: context.id,
    externalId: context.externalId,
    title: context.title,
    type: context.type.id,
    source: context.source,
  };
};
