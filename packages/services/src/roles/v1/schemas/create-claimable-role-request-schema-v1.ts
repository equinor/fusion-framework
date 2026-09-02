import { z } from 'zod';
import { AccessRoleMappingSchemaV1 } from './access-role-mapping-schema-v1';

/** Zod schema for the body of a create-claimable-role request. */
export const CreateClaimableRoleRequestSchemaV1 = z
  .object({
    /** Name of the claimable role. Only URL-safe characters are accepted. */
    name: z
      .string()
      .optional()
      .describe('Name of the claimable role. Only URL-safe characters are accepted.'),
    /** Human-readable display name. */
    displayName: z.string().optional().describe('Human-readable display name.'),
    /** Description of the claimable role. */
    description: z.string().optional().describe('Description of the claimable role.'),
    /** Identifier of the system the claimable role belongs to. */
    systemIdentifier: z
      .string()
      .nullish()
      .describe('Identifier of the system the claimable role belongs to.'),
    /** Access role mappings granted when the claimable role is activated. */
    accessRoleMappings: z
      .array(AccessRoleMappingSchemaV1)
      .optional()
      .describe('Access role mappings granted when the claimable role is activated.'),
  })
  .describe('The body of a create-claimable-role request.');

/**
 * Request body for creating a new claimable role.
 *
 * Roles API 1.0 model inferred from {@link CreateClaimableRoleRequestSchemaV1}, so
 * `CreateClaimableRoleRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreateClaimableRoleRequestV1 = z.infer<typeof CreateClaimableRoleRequestSchemaV1>;
