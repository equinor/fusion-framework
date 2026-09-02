import { z } from 'zod';
import { ApiAccessRoleSchemaV1 } from './api-access-role-schema-v1';

/** Zod schema for an access role granted by a role. */
export const ApiAccessRoleMappingSchemaV1 = z
  .object({
    /** The access role this mapping or assignment grants. */
    accessRole: ApiAccessRoleSchemaV1.optional().describe(
      'The access role this mapping or assignment grants.',
    ),
    /** Reason this access role is granted through the mapping. */
    reason: z
      .string()
      .optional()
      .describe('Reason this access role is granted through the mapping.'),
  })
  .describe('An access role granted by a role.');

/**
 * Maps an access role to a role or claimable role, with the reason for inclusion.
 *
 * Roles API 1.0 model inferred from {@link ApiAccessRoleMappingSchemaV1}, so
 * `ApiAccessRoleMappingV1` and the runtime validator can never describe different shapes.
 */
export type ApiAccessRoleMappingV1 = z.infer<typeof ApiAccessRoleMappingSchemaV1>;
