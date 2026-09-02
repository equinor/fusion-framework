import { z } from 'zod';

/**
 * Zod schema for the `AppCategoryIdentifier` model published by the Fusion Apps API 1.0.
 *
 * Optional category to assign the app to.
 *
 * The contract lists helper properties beside `type: string`, but Fusion Apps serialises
 * the value as a plain string, so the schema validates the string the wire carries.
 */
export const AppCategoryIdentifierSchemaV1 = z
  .string()
  .describe('Optional category to assign the app to.');

/**
 * Optional category to assign the app to.
 *
 * Apps API 1.0 model inferred from {@link AppCategoryIdentifierSchemaV1}, so
 * `AppCategoryIdentifierV1` and the runtime validator can never describe different shapes.
 */
export type AppCategoryIdentifierV1 = z.infer<typeof AppCategoryIdentifierSchemaV1>;
