import { z } from 'zod';
import type { ContextItem } from '@equinor/fusion-framework-module-context';

/**
 * Zod schema for a Fusion context metadata object.
 *
 * @remarks
 * Validates core context fields (id, type) and optional title, externalId,
 * and source. Used by {@link ContextSelectedCollector} and {@link AppLoadedCollector}.
 */
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

/** Inferred type from {@link contextSchema}. */
export type ContextItemType = z.infer<typeof contextSchema>;

/**
 * Extracts context metadata from a `ContextItem` for analytics events.
 *
 * @param context - The Fusion context item.
 * @returns An object with id, type, and optional title, externalId, and source.
 */
export const extractContextMetadata = (context: ContextItem): z.input<typeof contextSchema> => {
  return {
    id: context.id,
    externalId: context.externalId ?? undefined,
    title: context.title ?? undefined,
    type: context.type.id,
    source: context.source ?? undefined,
  };
};
