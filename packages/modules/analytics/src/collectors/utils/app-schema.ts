import { z } from 'zod';

/**
 * Zod schema for a Fusion application metadata object.
 *
 * @remarks
 * Validates core app fields (appKey, displayName, type) and optional build
 * and category information. Used by {@link AppLoadedCollector}.
 */
export const appSchema = z
  .object({
    appKey: z.string(),
    displayName: z.string(),
    type: z.string(),
    categoryName: z.string().optional(),
    buildVersion: z.string().optional(),
    buildTag: z.string().optional().nullable(),
  })
  .optional();

/** Inferred type from {@link appSchema}. */
export type AppItemType = z.infer<typeof appSchema>;
