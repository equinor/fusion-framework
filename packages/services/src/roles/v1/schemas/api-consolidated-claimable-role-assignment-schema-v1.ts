import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiClaimableRoleScopeSchemaV1 } from './api-claimable-role-scope-schema-v1';
import { ApiConsolidatedAssignmentEntrySchemaV1 } from './api-consolidated-assignment-entry-schema-v1';
import { ApiConsolidatedClaimableRoleRefSchemaV1 } from './api-consolidated-claimable-role-ref-schema-v1';

/** Zod schema for a consolidated claimable-role assignment. */
export const ApiConsolidatedClaimableRoleAssignmentSchemaV1 = z
  .object({
    /** Unique identifier of the consolidated assignment. */
    id: z.string().optional().describe('Unique identifier of the consolidated assignment.'),
    /** Account the assignment was granted to. */
    assignedTo: ApiAccountSchemaV1.optional().describe('Account the assignment was granted to.'),
    /** The claimable role this record refers to. */
    claimableRole: ApiConsolidatedClaimableRoleRefSchemaV1.optional().describe(
      'The claimable role this record refers to.',
    ),
    /** All reasons contributing to this consolidated assignment. */
    reasons: z
      .array(z.string())
      .optional()
      .describe('All reasons contributing to this consolidated assignment.'),
    /** Assignment type (e.g. "Direct" or "Inherited"). */
    type: z.string().optional().describe('Assignment type (e.g. "Direct" or "Inherited").'),
    /** Effective start date of the consolidated assignment, if any. Omitted when null. */
    validFrom: z
      .string()
      .nullish()
      .describe('Effective start date of the consolidated assignment, if any. Omitted when null.'),
    /** Effective end date of the consolidated assignment, if any. */
    validTo: z
      .string()
      .nullish()
      .describe('Effective end date of the consolidated assignment, if any.'),
    /** Whether the claimable role is currently active (claimed). */
    isActive: z
      .boolean()
      .optional()
      .describe('Whether the claimable role is currently active (claimed).'),
    /** Date and time until which the claimed role is active, if any. */
    activeTo: z
      .string()
      .nullish()
      .describe('Date and time until which the claimed role is active, if any.'),
    /** Scope restricting where the assignment applies, unless it is global. */
    scope: ApiClaimableRoleScopeSchemaV1.nullish().describe(
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
  .describe('A consolidated claimable-role assignment.');

/**
 * Represents a consolidated view of all claimable role assignments for an account and claimable
 * role combination.
 *
 * Roles API 1.0 model inferred from {@link ApiConsolidatedClaimableRoleAssignmentSchemaV1}, so
 * `ApiConsolidatedClaimableRoleAssignmentV1` and the runtime validator can never describe
 * different shapes.
 */
export type ApiConsolidatedClaimableRoleAssignmentV1 = z.infer<
  typeof ApiConsolidatedClaimableRoleAssignmentSchemaV1
>;
