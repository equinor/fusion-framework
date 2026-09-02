import { z } from 'zod';

/**
 * Zod schema for the `AppVersionIdentifier` model published by the Fusion Apps API 1.0.
 *
 * The version identifier (tag name) of the template app build to use.
 *
 * The contract lists helper properties beside `type: string`, but Fusion Apps serialises
 * the value as a plain string, so the schema validates the string the wire carries.
 */
export const AppVersionIdentifierSchemaV1 = z
  .string()
  .describe('The version identifier (tag name) of the template app build to use.');

/**
 * The version identifier (tag name) of the template app build to use.
 *
 * Apps API 1.0 model inferred from {@link AppVersionIdentifierSchemaV1}, so
 * `AppVersionIdentifierV1` and the runtime validator can never describe different shapes.
 */
export type AppVersionIdentifierV1 = z.infer<typeof AppVersionIdentifierSchemaV1>;
