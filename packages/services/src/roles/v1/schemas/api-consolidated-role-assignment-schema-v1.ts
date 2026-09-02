import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiConsolidatedAssignmentEntrySchemaV1 } from './api-consolidated-assignment-entry-schema-v1';
import { ApiRoleScopeSchemaV1 } from './api-role-scope-schema-v1';
import { ApiSimpleRoleSchemaV1 } from './api-simple-role-schema-v1';

/** Zod schema for a consolidated permanent role assignment. */
export const ApiConsolidatedRoleAssignmentSchemaV1 = z
  .object({
    /** Unique identifier of the consolidated assignment. */
    id: z.string().optional().describe('Unique identifier of the consolidated assignment.'),
    /** Account the assignment was granted to. */
    assignedTo: ApiAccountSchemaV1.optional().describe('Account the assignment was granted to.'),
    /** The role this record refers to. */
    role: ApiSimpleRoleSchemaV1.optional().describe('The role this record refers to.'),
    /** All reasons contributing to this consolidated assignment. */
    reasons: z
      .array(z.string())
      .optional()
      .describe('All reasons contributing to this consolidated assignment.'),
    /** Assignment type (e.g. "Direct" or "Inherited"). */
    type: z.string().optional().describe('Assignment type (e.g. "Direct" or "Inherited").'),
    /** Effective start date of the consolidated assignment, if any. */
    validFrom: z
      .string()
      .nullish()
      .describe('Effective start date of the consolidated assignment, if any.'),
    /** Effective end date of the consolidated assignment, if any. */
    validTo: z
      .string()
      .nullish()
      .describe('Effective end date of the consolidated assignment, if any.'),
    /** Scope restricting where the assignment applies, unless it is global. */
    scope: ApiRoleScopeSchemaV1.nullish().describe(
      'Scope restricting where the assignment applies, unless it is global.',
    ),
    /** Individual assignment entries contributing to this consolidated record, when expanded. */
    assignments: z
      .array(ApiConsolidatedAssignmentEntrySchemaV1)
      .nullish()
      .describe(
        'Individual assignment entries contributing to this consolidated record, when expanded.',
      ),
  })
  .describe('A consolidated permanent role assignment.');

/**
 * Represents a consolidated view of all role assignments for an account and role combination.
 *
 * Roles API 1.0 model inferred from {@link ApiConsolidatedRoleAssignmentSchemaV1}, so
 * `ApiConsolidatedRoleAssignmentV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiConsolidatedRoleAssignmentV1 = z.infer<typeof ApiConsolidatedRoleAssignmentSchemaV1>;
