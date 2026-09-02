import { z } from 'zod';
import { RoleBindingConfigurationBindingSchemaV1 } from './role-binding-configuration-binding-schema-v1';

/** Zod schema for the body of a create-role-binding-configuration request. */
export const CreateRoleBindingConfigurationRequestSchemaV1 = z
  .object({
    /** Schema version of the binding, for example `1.0`. */
    version: z.string().optional().describe('Schema version of the binding, for example `1.0`.'),
    /** Human-readable identifier for the binding configuration. */
    identifier: z
      .string()
      .optional()
      .describe('Human-readable identifier for the binding configuration.'),
    /** Name of the system the binding belongs to. */
    system: z.string().optional().describe('Name of the system the binding belongs to.'),
    /** Description of the binding configuration. */
    description: z.string().optional().describe('Description of the binding configuration.'),
    /** Reason the binding is being created. */
    reason: z.string().optional().describe('Reason the binding is being created.'),
    /** Binding type, either `EntraGroup` or `OrgChart`. */
    type: z.string().optional().describe('Binding type, either `EntraGroup` or `OrgChart`.'),
    /** Name of the source system managing the binding. */
    sourceSystem: z.string().optional().describe('Name of the source system managing the binding.'),
    /** Binding payload matching the declared `type`. */
    binding: RoleBindingConfigurationBindingSchemaV1.optional().describe(
      'Binding payload matching the declared `type`.',
    ),
  })
  .describe('The body of a create-role-binding-configuration request.');

/**
 * Request body for creating a new role binding configuration.
 *
 * Roles API 1.0 model inferred from {@link CreateRoleBindingConfigurationRequestSchemaV1}, so
 * `CreateRoleBindingConfigurationRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type CreateRoleBindingConfigurationRequestV1 = z.infer<
  typeof CreateRoleBindingConfigurationRequestSchemaV1
>;
