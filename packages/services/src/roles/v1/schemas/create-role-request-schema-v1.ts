import { z } from 'zod';
import { AccessRoleMappingSchemaV1 } from './access-role-mapping-schema-v1';

/** Zod schema for the body of a create-role request. */
export const CreateRoleRequestSchemaV1 = z
  .object({
    /** Name of the role. Only URL-safe characters are accepted. */
    name: z
      .string()
      .optional()
      .describe('Name of the role. Only URL-safe characters are accepted.'),
    /** Human-readable display name. */
    displayName: z.string().optional().describe('Human-readable display name.'),
    /** Description of the role. */
    description: z.string().optional().describe('Description of the role.'),
    /** Identifier of the system the role belongs to. */
    systemIdentifier: z
      .string()
      .nullish()
      .describe('Identifier of the system the role belongs to.'),
    /** Access role mappings granted to holders of the role. */
    accessRoleMappings: z
      .array(AccessRoleMappingSchemaV1)
      .optional()
      .describe('Access role mappings granted to holders of the role.'),
  })
  .describe('The body of a create-role request.');

/**
 * Request body for creating a new role.
 *
 * Roles API 1.0 model inferred from {@link CreateRoleRequestSchemaV1}, so `CreateRoleRequestV1`
 * and the runtime validator can never describe different shapes.
 */
export type CreateRoleRequestV1 = z.infer<typeof CreateRoleRequestSchemaV1>;
