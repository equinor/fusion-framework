import { z } from 'zod';
import { ApiAccessRoleSchemaV1 } from './api-access-role-schema-v1';

/** Zod schema for an access role granted by a claimable role. */
export const ApiClaimableAccessRoleMappingSchemaV1 = z
  .object({
    /** The access role this mapping or assignment grants. */
    accessRole: ApiAccessRoleSchemaV1.optional().describe(
      'The access role this mapping or assignment grants.',
    ),
    /** Reason this access role is granted through the claimable role. */
    reason: z
      .string()
      .nullish()
      .describe('Reason this access role is granted through the claimable role.'),
  })
  .describe('An access role granted by a claimable role.');

/**
 * Maps an access role to a claimable role, with the reason for inclusion.
 *
 * Roles API 1.0 model inferred from {@link ApiClaimableAccessRoleMappingSchemaV1}, so
 * `ApiClaimableAccessRoleMappingV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiClaimableAccessRoleMappingV1 = z.infer<typeof ApiClaimableAccessRoleMappingSchemaV1>;
