import { z } from 'zod';

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
