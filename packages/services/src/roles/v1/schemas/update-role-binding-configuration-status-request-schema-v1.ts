import { z } from 'zod';

/** Zod schema for the body of an update-role-binding-configuration-status request. */
export const UpdateRoleBindingConfigurationStatusRequestSchemaV1 = z
  .object({
    /** New status value, for example `Active`, `Pending`, or `Failed`. */
    status: z
      .string()
      .optional()
      .describe('New status value, for example `Active`, `Pending`, or `Failed`.'),
    /** Error message to associate with the status. */
    errorMessage: z.string().nullish().describe('Error message to associate with the status.'),
  })
  .describe('The body of an update-role-binding-configuration-status request.');

/**
 * Request body for updating the status of a role binding configuration.
 *
 * Roles API 1.0 model inferred from
 * {@link UpdateRoleBindingConfigurationStatusRequestSchemaV1}, so
 * `UpdateRoleBindingConfigurationStatusRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type UpdateRoleBindingConfigurationStatusRequestV1 = z.infer<
  typeof UpdateRoleBindingConfigurationStatusRequestSchemaV1
>;
