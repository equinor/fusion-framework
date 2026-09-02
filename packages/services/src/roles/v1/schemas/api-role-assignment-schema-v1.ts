import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';
import { ApiRoleScopeSchemaV1 } from './api-role-scope-schema-v1';
import { ApiSimpleRoleSchemaV1 } from './api-simple-role-schema-v1';

/** Zod schema for an assignment of a role to a Fusion account. */
export const ApiRoleAssignmentSchemaV1 = z
  .object({
    /** Unique identifier of the role assignment. */
    id: z.string().optional().describe('Unique identifier of the role assignment.'),
    /** Account the assignment was granted to. */
    assignedTo: ApiAccountSchemaV1.optional().describe('Account the assignment was granted to.'),
    /** The role this record refers to. */
    role: ApiSimpleRoleSchemaV1.optional().describe('The role this record refers to.'),
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
    /** Scope restricting where the assignment applies, unless it is global. */
    scope: ApiRoleScopeSchemaV1.nullish().describe(
      'Scope restricting where the assignment applies, unless it is global.',
    ),
    /** Labels attached to the assignment. */
    tags: z.array(z.string()).optional().describe('Labels attached to the assignment.'),
  })
  .describe('An assignment of a role to a Fusion account.');

/**
 * Represents an assignment of a role to an account.
 *
 * Roles API 1.0 model inferred from {@link ApiRoleAssignmentSchemaV1}, so `ApiRoleAssignmentV1`
 * and the runtime validator can never describe different shapes.
 */
export type ApiRoleAssignmentV1 = z.infer<typeof ApiRoleAssignmentSchemaV1>;
