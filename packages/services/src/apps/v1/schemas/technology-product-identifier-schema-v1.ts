import { z } from 'zod';

/**
 * Zod schema for the `TechnologyProductIdentifier` model published by the Fusion Apps API 1.0.
 *
 * The identifier of the technology product. Set to null to remove the association.
 *
 * The contract lists helper properties beside `type: string`, but Fusion Apps serialises
 * the value as a plain string, so the schema validates the string the wire carries.
 */
export const TechnologyProductIdentifierSchemaV1 = z
  .string()
  .describe('The identifier of the technology product. Set to null to remove the association.');

/**
 * The identifier of the technology product. Set to null to remove the association.
 *
 * Apps API 1.0 model inferred from {@link TechnologyProductIdentifierSchemaV1}, so
 * `TechnologyProductIdentifierV1` and the runtime validator can never describe different shapes.
 */
export type TechnologyProductIdentifierV1 = z.infer<typeof TechnologyProductIdentifierSchemaV1>;
