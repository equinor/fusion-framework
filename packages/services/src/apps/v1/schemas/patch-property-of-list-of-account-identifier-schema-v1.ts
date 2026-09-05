import { z } from 'zod';
import { AccountIdentifierSchemaV1 } from './account-identifier-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfListOfAccountIdentifier` model published by the Fusion Apps
 * API 1.0.
 *
 * Accounts that will be administrators of the app. Must contain at least one entry.
 */
export const PatchPropertyOfListOfAccountIdentifierSchemaV1 = z
  .array(AccountIdentifierSchemaV1)
  .nullable()
  .describe('Accounts that will be administrators of the app. Must contain at least one entry.');

/**
 * Accounts that will be administrators of the app. Must contain at least one entry.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfListOfAccountIdentifierSchemaV1}, so
 * `PatchPropertyOfListOfAccountIdentifierV1` and the runtime validator can never describe different
 * shapes.
 */
export type PatchPropertyOfListOfAccountIdentifierV1 = z.infer<
  typeof PatchPropertyOfListOfAccountIdentifierSchemaV1
>;
