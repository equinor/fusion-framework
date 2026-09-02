import { z } from 'zod';

/**
 * Zod schema for the `IdentifierType` model published by the Fusion Apps API 1.0.
 *
 * The kind of value an account or product identifier carries.
 */
export const IdentifierTypeSchemaV1 = z
  .enum(['UniqueId', 'Mail'])
  .describe('The kind of value an account or product identifier carries.');

/**
 * The kind of value an account or product identifier carries.
 *
 * Apps API 1.0 model inferred from {@link IdentifierTypeSchemaV1}, so `IdentifierTypeV1` and the
 * runtime validator can never describe different shapes.
 */
export type IdentifierTypeV1 = z.infer<typeof IdentifierTypeSchemaV1>;
