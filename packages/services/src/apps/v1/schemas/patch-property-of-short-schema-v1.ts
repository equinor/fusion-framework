import { z } from 'zod';

/**
 * Zod schema for the `PatchPropertyOfshort` model published by the Fusion Apps API 1.0.
 *
 * Updated sort order controlling the category's position in lists. Set to null to clear.
 */
export const PatchPropertyOfShortSchemaV1 = z
  .number()
  .nullable()
  .describe(
    "Updated sort order controlling the category's position in lists. Set to null to clear.",
  );

/**
 * Updated sort order controlling the category's position in lists. Set to null to clear.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfShortSchemaV1}, so
 * `PatchPropertyOfShortV1` and the runtime validator can never describe different shapes.
 */
export type PatchPropertyOfShortV1 = z.infer<typeof PatchPropertyOfShortSchemaV1>;
