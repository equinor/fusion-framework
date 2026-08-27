import { z } from 'zod';

/** Zod schema for the body of an update-claimable-role-assignment request. */
export const UpdateClaimableRoleAssignmentRequestSchemaV1 = z
  .object({
    /** New valid-to date. Pass `null` to clear the existing date. */
    validTo: z
      .string()
      .nullish()
      .describe('New valid-to date. Pass `null` to clear the existing date.'),
  })
  .describe('The body of an update-claimable-role-assignment request.');

/**
 * Patch request body for updating a claimable role assignment.
 *
 * Roles API 1.0 model inferred from {@link UpdateClaimableRoleAssignmentRequestSchemaV1}, so
 * `UpdateClaimableRoleAssignmentRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type UpdateClaimableRoleAssignmentRequestV1 = z.infer<
  typeof UpdateClaimableRoleAssignmentRequestSchemaV1
>;
