import { z } from 'zod';

/**
 * Zod schema for the `AccountIdentifier` model published by the Fusion Apps API 1.0.
 *
 * Azure Unique Id or Email.
 *
 * The contract lists helper properties beside `type: string`, but Fusion Apps serialises
 * the value as a plain string, so the schema validates the string the wire carries.
 */
export const AccountIdentifierSchemaV1 = z.string().describe('Azure Unique Id or Email.');

/**
 * Azure Unique Id or Email.
 *
 * Apps API 1.0 model inferred from {@link AccountIdentifierSchemaV1}, so `AccountIdentifierV1` and
 * the runtime validator can never describe different shapes.
 */
export type AccountIdentifierV1 = z.infer<typeof AccountIdentifierSchemaV1>;
