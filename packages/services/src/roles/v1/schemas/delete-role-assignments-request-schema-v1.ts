import { z } from 'zod';

/** Zod schema for the body of a batch delete-role-assignments request. */
export const DeleteRoleAssignmentsRequestSchemaV1 = z
  .object({
    /** IDs of role assignments to delete. The API accepts between one and 100. */
    roleAssignmentIds: z
      .array(z.string())
      .min(1, 'roleAssignmentIds requires at least one role assignment ID')
      .max(100, 'roleAssignmentIds accepts at most 100 role assignment IDs')
      .describe('IDs of role assignments to delete. The API accepts between one and 100.'),
  })
  .describe('The body of a batch delete-role-assignments request.');

/**
 * Request body for bulk-deleting role assignments.
 *
 * Roles API 1.0 model inferred from {@link DeleteRoleAssignmentsRequestSchemaV1}, so
 * `DeleteRoleAssignmentsRequestV1` and the runtime validator can never describe different
 * shapes.
 */
export type DeleteRoleAssignmentsRequestV1 = z.infer<typeof DeleteRoleAssignmentsRequestSchemaV1>;
