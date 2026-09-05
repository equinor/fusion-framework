import { z } from 'zod';

/**
 * Zod schema for the `PatchPropertyOfstring` model published by the Fusion Apps API 1.0.
 *
 * Updated human-readable display name. Set to null to clear.
 */
export const PatchPropertyOfStringSchemaV1 = z
  .string()
  .nullable()
  .describe('Updated human-readable display name. Set to null to clear.');

/**
 * Updated human-readable display name. Set to null to clear.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfStringSchemaV1}, so
 * `PatchPropertyOfStringV1` and the runtime validator can never describe different shapes.
 */
export type PatchPropertyOfStringV1 = z.infer<typeof PatchPropertyOfStringSchemaV1>;
