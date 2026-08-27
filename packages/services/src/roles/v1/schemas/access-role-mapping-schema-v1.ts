import { z } from 'zod';

/** Zod schema for an access role mapping supplied when creating or updating a role. */
export const AccessRoleMappingSchemaV1 = z
  .object({
    /** Access role ID or name to grant. */
    accessRoleIdentifier: z.string().optional().describe('Access role ID or name to grant.'),
    /** Reason for including this access role in the mapping. */
    reason: z.string().optional().describe('Reason for including this access role in the mapping.'),
  })
  .describe('An access role mapping supplied when creating or updating a role.');

/**
 * Maps an access role to a role or claimable role with a reason.
 *
 * Roles API 1.0 model inferred from {@link AccessRoleMappingSchemaV1}, so `AccessRoleMappingV1`
 * and the runtime validator can never describe different shapes.
 */
export type AccessRoleMappingV1 = z.infer<typeof AccessRoleMappingSchemaV1>;
