import { z } from 'zod';

/** Zod schema for the body of an update-claimable-role request. */
export const UpdateClaimableRoleRequestSchemaV1 = z
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
    /** New owning system identifier. Pass `null` to detach the claimable role. */
    systemIdentifier: z
      .string()
      .nullish()
      .describe('New owning system identifier. Pass `null` to detach the claimable role.'),
  })
  .describe('The body of an update-claimable-role request.');

/**
 * Patch request body for updating a claimable role.
 *
 * Roles API 1.0 model inferred from {@link UpdateClaimableRoleRequestSchemaV1}, so
 * `UpdateClaimableRoleRequestV1` and the runtime validator can never describe different shapes.
 */
export type UpdateClaimableRoleRequestV1 = z.infer<typeof UpdateClaimableRoleRequestSchemaV1>;
