import { z } from 'zod';

/** Zod schema for the execution status of a role binding configuration. */
export const ApiRoleBindingConfigurationStatusSchemaV1 = z
  .object({
    /** Unique identifier of the status record. */
    id: z.string().optional().describe('Unique identifier of the status record.'),
    /** Identifier of the associated role binding configuration. */
    identifier: z
      .string()
      .optional()
      .describe('Identifier of the associated role binding configuration.'),
    /** Current status (e.g. "Pending", "Active", "Failed"). */
    status: z.string().optional().describe('Current status (e.g. "Pending", "Active", "Failed").'),
    /** Error message if the last execution failed, if any. */
    errorMessage: z
      .string()
      .nullish()
      .describe('Error message if the last execution failed, if any.'),
    /** Date and time the status record was created. */
    createdDate: z.string().optional().describe('Date and time the status record was created.'),
    /** Date and time the status was last updated, if any. */
    updatedDate: z
      .string()
      .nullish()
      .describe('Date and time the status was last updated, if any.'),
  })
  .describe('The execution status of a role binding configuration.');

/**
 * Represents the execution status of a role binding configuration.
 *
 * Roles API 1.0 model inferred from {@link ApiRoleBindingConfigurationStatusSchemaV1}, so
 * `ApiRoleBindingConfigurationStatusV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiRoleBindingConfigurationStatusV1 = z.infer<
  typeof ApiRoleBindingConfigurationStatusSchemaV1
>;
