import { z } from 'zod';
import { AccountIdentifierSchemaV1 } from './account-identifier-schema-v1';

/**
 * Zod schema for the `UpdateBusinessOwnerRequest` model published by the Fusion Apps API 1.0.
 *
 * Represents a business owner entry to assign to an app.
 */
export const UpdateBusinessOwnerRequestSchemaV1 = z
  .object({
    /** Account registered as business owner. */
    accountIdentifier: AccountIdentifierSchemaV1.optional().describe(
      'Account registered as business owner.',
    ),
    /** An optional explanation for assigning this person as a business owner. */
    reason: z
      .string()
      .nullish()
      .describe('An optional explanation for assigning this person as a business owner.'),
    /** The role of the business owner, e.g. BusinessOwner or DataOwner. */
    role: z
      .string()
      .optional()
      .describe('The role of the business owner, e.g. BusinessOwner or DataOwner.'),
  })
  .describe('Represents a business owner entry to assign to an app.');

/**
 * Represents a business owner entry to assign to an app.
 *
 * Apps API 1.0 model inferred from {@link UpdateBusinessOwnerRequestSchemaV1}, so
 * `UpdateBusinessOwnerRequestV1` and the runtime validator can never describe different shapes.
 */
export type UpdateBusinessOwnerRequestV1 = z.infer<typeof UpdateBusinessOwnerRequestSchemaV1>;
