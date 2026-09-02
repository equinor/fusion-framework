import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiSimpleClaimableRoleSchemaV1 } from './api-simple-claimable-role-schema-v1';

/** Zod schema for a complete claimable role returned by the Fusion Roles V2 API. */
export const ApiClaimableRoleSchemaV1 = ApiSimpleClaimableRoleSchemaV1.and(
  z.object({
    /** Account that created the record. */
    createdBy: ApiAccountSchemaV1.optional().describe('Account that created the record.'),
    /** Date and time this claimable role was created. */
    createdDate: z.string().optional().describe('Date and time this claimable role was created.'),
    /** Account that last updated the record, if it has been updated. */
    updatedBy: ApiAccountSchemaV1.nullish().describe(
      'Account that last updated the record, if it has been updated.',
    ),
    /** Date and time this claimable role was last updated, if any. Omitted when null. */
    updatedDate: z
      .string()
      .nullish()
      .describe('Date and time this claimable role was last updated, if any. Omitted when null.'),
  }),
).describe('A complete claimable role returned by the Fusion Roles V2 API.');

/**
 * Represents a claimable role with full details including access role mappings and audit
 * fields.
 *
 * Roles API 1.0 model inferred from {@link ApiClaimableRoleSchemaV1}, so `ApiClaimableRoleV1`
 * and the runtime validator can never describe different shapes.
 */
export type ApiClaimableRoleV1 = z.infer<typeof ApiClaimableRoleSchemaV1>;
