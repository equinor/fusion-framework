import { z } from 'zod';
import { RoleBindingConfigurationBindingSchemaV1 } from './role-binding-configuration-binding-schema-v1';

/** Zod schema for the body of an update-role-binding-configuration request. */
export const UpdateRoleBindingConfigurationRequestSchemaV1 = z
  .object({
    /** New owning system. Pass `null` to clear the existing value. */
    system: z
      .string()
      .nullish()
      .describe('New owning system. Pass `null` to clear the existing value.'),
    /** New description. Pass `null` to clear the existing value. */
    description: z
      .string()
      .nullish()
      .describe('New description. Pass `null` to clear the existing value.'),
    /** New reason. Pass `null` to clear the existing value. */
    reason: z.string().nullish().describe('New reason. Pass `null` to clear the existing value.'),
    /** New binding type. Pass `null` to clear the existing value. */
    type: z
      .string()
      .nullish()
      .describe('New binding type. Pass `null` to clear the existing value.'),
    /** New source system. Pass `null` to clear the existing value. */
    sourceSystem: z
      .string()
      .nullish()
      .describe('New source system. Pass `null` to clear the existing value.'),
    /** New binding payload. Pass `null` to clear the existing payload. */
    binding: RoleBindingConfigurationBindingSchemaV1.nullish().describe(
      'New binding payload. Pass `null` to clear the existing payload.',
    ),
  })
  .describe('The body of an update-role-binding-configuration request.');

/**
 * Patch request body for updating a role binding configuration.
 *
 * Roles API 1.0 model inferred from {@link UpdateRoleBindingConfigurationRequestSchemaV1}, so
 * `UpdateRoleBindingConfigurationRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type UpdateRoleBindingConfigurationRequestV1 = z.infer<
  typeof UpdateRoleBindingConfigurationRequestSchemaV1
>;
