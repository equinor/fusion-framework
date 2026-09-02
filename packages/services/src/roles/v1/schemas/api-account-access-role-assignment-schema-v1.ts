import { z } from 'zod';
import { ApiAccountAccessRoleSchemaV1 } from './api-account-access-role-schema-v1';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiScopeSchemaV1 } from './api-scope-schema-v1';
import { ApiSimpleClaimableRoleAssignmentSchemaV1 } from './api-simple-claimable-role-assignment-schema-v1';
import { ApiSimpleRoleAssignmentSchemaV1 } from './api-simple-role-assignment-schema-v1';

/** Zod schema for an access-role assignment returned from an account-centric query. */
export const ApiAccountAccessRoleAssignmentSchemaV1 = z
  .object({
    /** Unique identifier of the assignment. */
    id: z.string().optional().describe('Unique identifier of the assignment.'),
    /** Account the assignment was granted to. */
    assignedTo: ApiAccountSchemaV1.optional().describe('Account the assignment was granted to.'),
    /** The access role this mapping or assignment grants. */
    accessRole: ApiAccountAccessRoleSchemaV1.nullish().describe(
      'The access role this mapping or assignment grants.',
    ),
    /** Assignment type (e.g. "Direct" or "Inherited"). */
    type: z.string().optional().describe('Assignment type (e.g. "Direct" or "Inherited").'),
    /** Scope restricting where the assignment applies, unless it is global. */
    scope: ApiScopeSchemaV1.nullish().describe(
      'Scope restricting where the assignment applies, unless it is global.',
    ),
    /** Reason for the assignment. */
    reason: z.string().optional().describe('Reason for the assignment.'),
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
    /** Date from which the assignment is valid, if any. */
    validFrom: z.string().nullish().describe('Date from which the assignment is valid, if any.'),
    /** Date until which the assignment is valid, if any. */
    validTo: z.string().nullish().describe('Date until which the assignment is valid, if any.'),
    /** Whether the assignment is currently active. */
    isActive: z.boolean().optional().describe('Whether the assignment is currently active.'),
    /** Labels attached to the assignment. */
    tags: z.array(z.string()).optional().describe('Labels attached to the assignment.'),
    /** The role assignment this record originates from, if any. */
    roleAssignment: ApiSimpleRoleAssignmentSchemaV1.nullish().describe(
      'The role assignment this record originates from, if any.',
    ),
    /** The claimable role assignment this record originates from, if any. */
    claimableRoleAssignment: ApiSimpleClaimableRoleAssignmentSchemaV1.nullish().describe(
      'The claimable role assignment this record originates from, if any.',
    ),
  })
  .describe('An access-role assignment returned from an account-centric query.');

/**
 * Represents an access role assignment as seen from an account context.
 *
 * Roles API 1.0 model inferred from {@link ApiAccountAccessRoleAssignmentSchemaV1}, so
 * `ApiAccountAccessRoleAssignmentV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiAccountAccessRoleAssignmentV1 = z.infer<
  typeof ApiAccountAccessRoleAssignmentSchemaV1
>;
