import { z } from 'zod';

/**
 * Zod schema for the `PatchPropertyOfboolean` model published by the Fusion Apps API 1.0.
 *
 * Updated flag indicating whether this is a custom context type.
 */
export const PatchPropertyOfBooleanSchemaV1 = z
  .boolean()
  .nullable()
  .describe('Updated flag indicating whether this is a custom context type.');

/**
 * Updated flag indicating whether this is a custom context type.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfBooleanSchemaV1}, so
 * `PatchPropertyOfBooleanV1` and the runtime validator can never describe different shapes.
 */
export type PatchPropertyOfBooleanV1 = z.infer<typeof PatchPropertyOfBooleanSchemaV1>;
