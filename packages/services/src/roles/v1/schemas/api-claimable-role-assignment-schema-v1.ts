import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiClaimableRoleScopeSchemaV1 } from './api-claimable-role-scope-schema-v1';
import { ApiSimpleClaimableRoleSchemaV1 } from './api-simple-claimable-role-schema-v1';

/** Zod schema for an assignment of a claimable role to a Fusion account. */
export const ApiClaimableRoleAssignmentSchemaV1 = z
  .object({
    /** Unique identifier of the assignment. */
    id: z.string().optional().describe('Unique identifier of the assignment.'),
    /** Account the assignment was granted to. */
    assignedTo: ApiAccountSchemaV1.optional().describe('Account the assignment was granted to.'),
    /** The claimable role this record refers to. */
    claimableRole: ApiSimpleClaimableRoleSchemaV1.optional().describe(
      'The claimable role this record refers to.',
    ),
    /** The origin system that created this assignment, if any. */
    source: z
      .string()
      .nullish()
      .describe('The origin system that created this assignment, if any.'),
    /** Identifier in the originating system, if any. */
    externalIdentifier: z
      .string()
      .nullish()
      .describe('Identifier in the originating system, if any.'),
    /** Reason for the assignment. */
    reason: z.string().optional().describe('Reason for the assignment.'),
    /** Assignment type (e.g. "Direct" or "Inherited"). */
    type: z.string().optional().describe('Assignment type (e.g. "Direct" or "Inherited").'),
    /** Date from which the assignment is valid, if any. */
    validFrom: z.string().nullish().describe('Date from which the assignment is valid, if any.'),
    /** Date until which the assignment is valid, if any. */
    validTo: z.string().nullish().describe('Date until which the assignment is valid, if any.'),
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
    /** Labels attached to the assignment. */
    tags: z.array(z.string()).optional().describe('Labels attached to the assignment.'),
  })
  .describe('An assignment of a claimable role to a Fusion account.');

/**
 * Represents an assignment of a claimable role to an account.
 *
 * Roles API 1.0 model inferred from {@link ApiClaimableRoleAssignmentSchemaV1}, so
 * `ApiClaimableRoleAssignmentV1` and the runtime validator can never describe different shapes.
 */
export type ApiClaimableRoleAssignmentV1 = z.infer<typeof ApiClaimableRoleAssignmentSchemaV1>;
