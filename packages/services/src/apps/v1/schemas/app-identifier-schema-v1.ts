import { z } from 'zod';

/**
 * Zod schema for the `AppIdentifier` model published by the Fusion Apps API 1.0.
 *
 * The identifier of the template app.
 *
 * The contract lists helper properties beside `type: string`, but Fusion Apps serialises
 * the value as a plain string, so the schema validates the string the wire carries.
 */
export const AppIdentifierSchemaV1 = z.string().describe('The identifier of the template app.');

/**
 * The identifier of the template app.
 *
 * Apps API 1.0 model inferred from {@link AppIdentifierSchemaV1}, so `AppIdentifierV1` and the
 * runtime validator can never describe different shapes.
 */
export type AppIdentifierV1 = z.infer<typeof AppIdentifierSchemaV1>;
