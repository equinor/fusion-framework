import { z } from 'zod';

/** Zod schema fragment validating the `$top` pagination option (0 through 100 inclusive). */
export const TopSchemaV1 = z
  .number()
  .int('$top must be a non-negative integer no greater than 100')
  .min(0, '$top must be a non-negative integer no greater than 100')
  .max(100, '$top must be a non-negative integer no greater than 100')
  .optional()
  .describe('the `$top` pagination option (0 through 100 inclusive).');

/**
 * The `$top` pagination option Apps API 1.0 accepts on collection endpoints: 0 through 100 records.
 *
 * Apps API 1.0 model inferred from {@link TopSchemaV1}, so `TopV1` and the runtime validator can
 * never describe different shapes.
 */
export type TopV1 = z.infer<typeof TopSchemaV1>;
