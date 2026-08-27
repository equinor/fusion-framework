import { z } from 'zod';

/** Zod schema for the body of an update-role request. */
export const UpdateRoleRequestSchemaV1 = z
  .object({
    /** New display name. Pass `null` to clear the existing value. */
    displayName: z
      .string()
      .nullish()
      .describe('New display name. Pass `null` to clear the existing value.'),
    /** New description. Pass `null` to clear the existing value. */
    description: z
      .string()
      .nullish()
      .describe('New description. Pass `null` to clear the existing value.'),
    /** New owning system identifier. Pass `null` to detach the role. */
    systemIdentifier: z
      .string()
      .nullish()
      .describe('New owning system identifier. Pass `null` to detach the role.'),
  })
  .describe('The body of an update-role request.');

/**
 * Patch request body for updating a role.
 *
 * Roles API 1.0 model inferred from {@link UpdateRoleRequestSchemaV1}, so `UpdateRoleRequestV1`
 * and the runtime validator can never describe different shapes.
 */
export type UpdateRoleRequestV1 = z.infer<typeof UpdateRoleRequestSchemaV1>;
