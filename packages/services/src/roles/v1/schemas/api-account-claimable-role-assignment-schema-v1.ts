import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiClaimableRoleAssignmentSchemaV1 } from './api-claimable-role-assignment-schema-v1';

/** Zod schema for a claimable-role assignment returned from an account-centric query. */
export const ApiAccountClaimableRoleAssignmentSchemaV1 = ApiClaimableRoleAssignmentSchemaV1.and(
  z.object({
    /** Account that created the record. */
    createdBy: ApiAccountSchemaV1.optional().describe('Account that created the record.'),
    /** Date and time this assignment was created. */
    createdDate: z.string().optional().describe('Date and time this assignment was created.'),
  }),
).describe('A claimable-role assignment returned from an account-centric query.');

/**
 * Represents a claimable role assignment as seen from an account context, including audit
 * fields.
 *
 * Roles API 1.0 model inferred from {@link ApiAccountClaimableRoleAssignmentSchemaV1}, so
 * `ApiAccountClaimableRoleAssignmentV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiAccountClaimableRoleAssignmentV1 = z.infer<
  typeof ApiAccountClaimableRoleAssignmentSchemaV1
>;
