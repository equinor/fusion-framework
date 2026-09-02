import { z } from 'zod';

/** Zod schema for the body of an update-access-role request. */
export const UpdateAccessRoleRequestSchemaV1 = z
  .object({
    /** New description. Pass `null` to clear the existing description. */
    description: z
      .string()
      .nullish()
      .describe('New description. Pass `null` to clear the existing description.'),
  })
  .describe('The body of an update-access-role request.');

/**
 * Patch request body for updating an access role.
 *
 * Roles API 1.0 model inferred from {@link UpdateAccessRoleRequestSchemaV1}, so
 * `UpdateAccessRoleRequestV1` and the runtime validator can never describe different shapes.
 */
export type UpdateAccessRoleRequestV1 = z.infer<typeof UpdateAccessRoleRequestSchemaV1>;
