import { z } from 'zod';

/**
 * Zod schema for the `PatchPropertyOfListOfstring` model published by the Fusion Apps API 1.0.
 *
 * Searchable keywords associated with the app.
 */
export const PatchPropertyOfListOfStringSchemaV1 = z
  .array(z.string())
  .nullable()
  .describe('Searchable keywords associated with the app.');

/**
 * Searchable keywords associated with the app.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfListOfStringSchemaV1}, so
 * `PatchPropertyOfListOfStringV1` and the runtime validator can never describe different shapes.
 */
export type PatchPropertyOfListOfStringV1 = z.infer<typeof PatchPropertyOfListOfStringSchemaV1>;
