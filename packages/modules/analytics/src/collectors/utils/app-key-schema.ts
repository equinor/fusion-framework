import { z } from 'zod';

/**
 * Zod schema for an object containing an optional `appKey` string.
 *
 * @remarks
 * Used by {@link AppSelectedCollector} to validate the event body.
 */
export const appKeySchema = z
  .object({
    appKey: z.string().optional(),
  })
  .optional()
  .nullable();

/** Inferred type from {@link appKeySchema}. */
export type AppKeyType = z.infer<typeof appKeySchema>;
