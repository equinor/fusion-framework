import { z } from 'zod';

/** Zod schema for the body of an update-role-assignment request. */
export const UpdateRoleAssignmentRequestSchemaV1 = z
  .object({
    /** New valid-to date. Pass `null` to clear the existing date. */
    validTo: z
      .string()
      .nullish()
      .describe('New valid-to date. Pass `null` to clear the existing date.'),
  })
  .describe('The body of an update-role-assignment request.');

/**
 * Patch request body for updating a role assignment.
 *
 * Roles API 1.0 model inferred from {@link UpdateRoleAssignmentRequestSchemaV1}, so
 * `UpdateRoleAssignmentRequestV1` and the runtime validator can never describe different
 * shapes.
 */
export type UpdateRoleAssignmentRequestV1 = z.infer<typeof UpdateRoleAssignmentRequestSchemaV1>;
