import { z } from 'zod';

/** Zod schema fragment validating the `$skip` pagination option (a non-negative record offset). */
export const SkipSchemaV1 = z
  .number()
  .int('$skip must be a non-negative integer')
  .min(0, '$skip must be a non-negative integer')
  .optional()
  .describe('the `$skip` pagination option (a non-negative record offset).');

/**
 * The `$skip` pagination option Apps API 1.0 accepts on collection endpoints.
 *
 * Apps API 1.0 model inferred from {@link SkipSchemaV1}, so `SkipV1` and the runtime validator can
 * never describe different shapes.
 */
export type SkipV1 = z.infer<typeof SkipSchemaV1>;
