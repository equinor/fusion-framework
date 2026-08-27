import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiSimpleClaimableRoleAssignmentSchemaV1 } from './api-simple-claimable-role-assignment-schema-v1';

/** Zod schema for an activation record enriched with its claimable role assignment. */
export const ApiExtendedClaimableRoleAssignmentActivationSchemaV1 = z
  .object({
    /** Unique identifier of the activation record. */
    id: z.string().optional().describe('Unique identifier of the activation record.'),
    /** The claimable role assignment this record originates from, if any. */
    claimableRoleAssignment: ApiSimpleClaimableRoleAssignmentSchemaV1.optional().describe(
      'The claimable role assignment this record originates from, if any.',
    ),
    /** Date and time the claimable role was activated. */
    activationDate: z
      .string()
      .optional()
      .describe('Date and time the claimable role was activated.'),
    /** Date and time the activation expires. */
    activeToDate: z.string().optional().describe('Date and time the activation expires.'),
    /** Reason provided when claiming the role. */
    reason: z.string().optional().describe('Reason provided when claiming the role.'),
    /** Account that activated (claimed) the assignment. */
    activatedBy: ApiAccountSchemaV1.optional().describe(
      'Account that activated (claimed) the assignment.',
    ),
  })
  .describe('An activation record enriched with its claimable role assignment.');

/**
 * Represents an activation record for a claimable role assignment with the full assignment
 * details included.
 *
 * Roles API 1.0 model inferred from
 * {@link ApiExtendedClaimableRoleAssignmentActivationSchemaV1}, so
 * `ApiExtendedClaimableRoleAssignmentActivationV1` and the runtime validator can never describe
 * different shapes.
 */
export type ApiExtendedClaimableRoleAssignmentActivationV1 = z.infer<
  typeof ApiExtendedClaimableRoleAssignmentActivationSchemaV1
>;
