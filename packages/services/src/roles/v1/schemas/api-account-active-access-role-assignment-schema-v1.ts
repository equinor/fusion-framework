import { z } from 'zod';
import { ApiScopeValuesSchemaV1 } from './api-scope-values-schema-v1';

/** Zod schema for a currently active access-role assignment returned for an account. */
export const ApiAccountActiveAccessRoleAssignmentSchemaV1 = z
  .object({
    /** Name of the system the access role belongs to. */
    systemName: z.string().optional().describe('Name of the system the access role belongs to.'),
    /** Name of the access role. */
    accessRoleName: z.string().optional().describe('Name of the access role.'),
    /** Assignment type (e.g. "Direct" or "Inherited"). */
    assignmentType: z
      .string()
      .optional()
      .describe('Assignment type (e.g. "Direct" or "Inherited").'),
    /** Scope restricting where the assignment applies, unless it is global. */
    scope: ApiScopeValuesSchemaV1.nullish().describe(
      'Scope restricting where the assignment applies, unless it is global.',
    ),
    /** Date and time the activation expires, if any. */
    activeToDate: z.string().nullish().describe('Date and time the activation expires, if any.'),
  })
  .describe('A currently active access-role assignment returned for an account.');

/**
 * Represents a currently active access role assignment for an account.
 *
 * Roles API 1.0 model inferred from {@link ApiAccountActiveAccessRoleAssignmentSchemaV1}, so
 * `ApiAccountActiveAccessRoleAssignmentV1` and the runtime validator can never describe
 * different shapes.
 */
export type ApiAccountActiveAccessRoleAssignmentV1 = z.infer<
  typeof ApiAccountActiveAccessRoleAssignmentSchemaV1
>;
