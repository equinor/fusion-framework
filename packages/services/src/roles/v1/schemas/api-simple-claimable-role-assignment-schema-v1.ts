import { z } from 'zod';
import { ApiSimpleClaimableRoleSchemaV1 } from './api-simple-claimable-role-schema-v1';

/** Zod schema for the minimal claimable role assignment that contributed an account access role. */
export const ApiSimpleClaimableRoleAssignmentSchemaV1 = z
  .object({
    /** Unique identifier of the claimable role assignment. */
    id: z.string().optional().describe('Unique identifier of the claimable role assignment.'),
    /** The claimable role this record refers to. */
    claimableRole: ApiSimpleClaimableRoleSchemaV1.optional().describe(
      'The claimable role this record refers to.',
    ),
  })
  .describe('The minimal claimable role assignment that contributed an account access role.');

/**
 * A claimable role assignment in condensed form, as embedded in the access role assignment it
 * triggered.
 *
 * Roles API 1.0 model inferred from {@link ApiSimpleClaimableRoleAssignmentSchemaV1}, so
 * `ApiSimpleClaimableRoleAssignmentV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiSimpleClaimableRoleAssignmentV1 = z.infer<
  typeof ApiSimpleClaimableRoleAssignmentSchemaV1
>;
