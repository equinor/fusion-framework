import { z } from 'zod';

/** Zod schema for the body of an update-access-role-assignment request. */
export const UpdateAccessRoleAssignmentRequestSchemaV1 = z
  .object({
    /** New valid-to date. Pass `null` to clear the existing date. */
    validTo: z
      .string()
      .nullish()
      .describe('New valid-to date. Pass `null` to clear the existing date.'),
  })
  .describe('The body of an update-access-role-assignment request.');

/**
 * Patch request body for updating an access role assignment.
 *
 * Roles API 1.0 model inferred from {@link UpdateAccessRoleAssignmentRequestSchemaV1}, so
 * `UpdateAccessRoleAssignmentRequestV1` and the runtime validator can never describe different
 * shapes.
 */
export type UpdateAccessRoleAssignmentRequestV1 = z.infer<
  typeof UpdateAccessRoleAssignmentRequestSchemaV1
>;
