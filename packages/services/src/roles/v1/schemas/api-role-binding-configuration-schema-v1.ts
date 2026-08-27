import { z } from 'zod';

/** Zod schema for a stored role binding configuration. */
export const ApiRoleBindingConfigurationSchemaV1 = z
  .object({
    /** Unique identifier of the role binding configuration. */
    id: z.string().optional().describe('Unique identifier of the role binding configuration.'),
    /** Schema version of the binding configuration. */
    version: z.string().optional().describe('Schema version of the binding configuration.'),
    /** Human-readable identifier for this binding configuration. */
    identifier: z
      .string()
      .optional()
      .describe('Human-readable identifier for this binding configuration.'),
    /** Description of this binding configuration. */
    description: z.string().optional().describe('Description of this binding configuration.'),
    /** Reason this binding was created. */
    reason: z.string().optional().describe('Reason this binding was created.'),
    /** The system this binding belongs to. */
    system: z.string().optional().describe('The system this binding belongs to.'),
    /** Binding type (e.g. "EntraGroup" or "OrgChart"). */
    type: z.string().optional().describe('Binding type (e.g. "EntraGroup" or "OrgChart").'),
    /** The source system that manages this binding. */
    sourceSystem: z.string().optional().describe('The source system that manages this binding.'),
    /** Whether this binding configuration has been soft-deleted. */
    isDeleted: z
      .boolean()
      .optional()
      .describe('Whether this binding configuration has been soft-deleted.'),
    /** Binding configuration payload. Shape depends on . */
    binding: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Binding configuration payload. Shape depends on .'),
  })
  .describe('A stored role binding configuration.');

/**
 * Represents a role binding configuration that maps an external source system to role
 * assignments.
 *
 * Roles API 1.0 model inferred from {@link ApiRoleBindingConfigurationSchemaV1}, so
 * `ApiRoleBindingConfigurationV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiRoleBindingConfigurationV1 = z.infer<typeof ApiRoleBindingConfigurationSchemaV1>;
