import { z } from 'zod';
import { AccessRoleMappingSchemaV1 } from './access-role-mapping-schema-v1';

/** Zod schema for the body of an add-claimable-role-access-roles request. */
export const AddClaimableRoleAccessRoleRequestSchemaV1 = z
  .object({
    /** Access role mappings to add. The API requires at least one. */
    accessRoleMappings: z
      .array(AccessRoleMappingSchemaV1)
      .min(1, 'accessRoleMappings requires at least one access role mapping')
      .describe('Access role mappings to add. The API requires at least one.'),
  })
  .describe('The body of an add-claimable-role-access-roles request.');

/**
 * Request body for adding access role mappings to a claimable role.
 *
 * Roles API 1.0 model inferred from {@link AddClaimableRoleAccessRoleRequestSchemaV1}, so
 * `AddClaimableRoleAccessRoleRequestV1` and the runtime validator can never describe different
 * shapes.
 */
export type AddClaimableRoleAccessRoleRequestV1 = z.infer<
  typeof AddClaimableRoleAccessRoleRequestSchemaV1
>;
