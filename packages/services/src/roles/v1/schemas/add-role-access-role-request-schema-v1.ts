import { z } from 'zod';
import { AccessRoleMappingSchemaV1 } from './access-role-mapping-schema-v1';

/** Zod schema for the body of an add-role-access-roles request. */
export const AddRoleAccessRoleRequestSchemaV1 = z
  .object({
    /** Access role mappings to add. The API requires at least one. */
    accessRoleMappings: z
      .array(AccessRoleMappingSchemaV1)
      .optional()
      .describe('Access role mappings to add. The API requires at least one.'),
  })
  .describe('The body of an add-role-access-roles request.');

/**
 * Request body for adding access role mappings to a role.
 *
 * Roles API 1.0 model inferred from {@link AddRoleAccessRoleRequestSchemaV1}, so
 * `AddRoleAccessRoleRequestV1` and the runtime validator can never describe different shapes.
 */
export type AddRoleAccessRoleRequestV1 = z.infer<typeof AddRoleAccessRoleRequestSchemaV1>;
