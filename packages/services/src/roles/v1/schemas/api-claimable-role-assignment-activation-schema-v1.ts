import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';

/** Zod schema for the activation record returned after a claimable role is claimed. */
export const ApiClaimableRoleAssignmentActivationSchemaV1 = z
  .object({
    /** Unique identifier of the activation record. */
    id: z.string().optional().describe('Unique identifier of the activation record.'),
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
  .describe('The activation record returned after a claimable role is claimed.');

/**
 * Represents an activation record for a claimable role assignment.
 *
 * Roles API 1.0 model inferred from {@link ApiClaimableRoleAssignmentActivationSchemaV1}, so
 * `ApiClaimableRoleAssignmentActivationV1` and the runtime validator can never describe
 * different shapes.
 */
export type ApiClaimableRoleAssignmentActivationV1 = z.infer<
  typeof ApiClaimableRoleAssignmentActivationSchemaV1
>;
