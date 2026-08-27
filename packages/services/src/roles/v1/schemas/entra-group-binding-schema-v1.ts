import { z } from 'zod';
import { ClaimableRoleBindingSchemaV1 } from './claimable-role-binding-schema-v1';
import { EntraGroupSchemaV1 } from './entra-group-schema-v1';
import { RoleBindingSchemaV1 } from './role-binding-schema-v1';

/** Zod schema for an Entra group binding configuration payload. */
export const EntraGroupBindingSchemaV1 = z
  .object({
    /** Binding schema version, for example `1.0`. */
    version: z.string().describe('Binding schema version, for example `1.0`.'),
    /** Entra ID group whose membership drives the binding. */
    group: EntraGroupSchemaV1.describe('Entra ID group whose membership drives the binding.'),
    /** Roles assigned to members of the group. */
    roles: z
      .array(RoleBindingSchemaV1)
      .nullish()
      .describe('Roles assigned to members of the group.'),
    /** Claimable roles offered to members of the group. */
    claimableRoles: z
      .array(ClaimableRoleBindingSchemaV1)
      .nullish()
      .describe('Claimable roles offered to members of the group.'),
  })
  .describe('An Entra group binding configuration payload.');

/**
 * Binding configuration for an Entra ID (Azure AD) group. Maps group membership to role and
 * claimable-role assignments.
 *
 * Roles API 1.0 model inferred from {@link EntraGroupBindingSchemaV1}, so `EntraGroupBindingV1`
 * and the runtime validator can never describe different shapes.
 */
export type EntraGroupBindingV1 = z.infer<typeof EntraGroupBindingSchemaV1>;
