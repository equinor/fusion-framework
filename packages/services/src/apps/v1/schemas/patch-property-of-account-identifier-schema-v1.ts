import type { z } from 'zod';
import { AccountIdentifierSchemaV1 } from './account-identifier-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfAccountIdentifier` model published by the Fusion Apps API 1.0.
 *
 * Updated account of the business solution owner.
 */
export const PatchPropertyOfAccountIdentifierSchemaV1 =
  AccountIdentifierSchemaV1.nullable().describe('Updated account of the business solution owner.');

/**
 * Updated account of the business solution owner.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfAccountIdentifierSchemaV1}, so
 * `PatchPropertyOfAccountIdentifierV1` and the runtime validator can never describe different
 * shapes.
 */
export type PatchPropertyOfAccountIdentifierV1 = z.infer<
  typeof PatchPropertyOfAccountIdentifierSchemaV1
>;
