import { z } from 'zod';
import { RequestScopeSchemaV1 } from './request-scope-schema-v1';

/** Zod schema for the body of an assign-access-role request. */
export const AssignAccessRoleRequestSchemaV1 = z
  .object({
    /** Mail or Azure unique ID of the account to assign the access role to. */
    accountIdentifier: z
      .string()
      .optional()
      .describe('Mail or Azure unique ID of the account to assign the access role to.'),
    /** Reason for the assignment. */
    reason: z.string().optional().describe('Reason for the assignment.'),
    /** Origin system creating this assignment. */
    source: z.string().optional().describe('Origin system creating this assignment.'),
    /** Identifier of the assignment in the originating system. */
    externalIdentifier: z
      .string()
      .optional()
      .describe('Identifier of the assignment in the originating system.'),
    /** Assignment type, either `Direct` or `Inherited`. */
    type: z.string().optional().describe('Assignment type, either `Direct` or `Inherited`.'),
    /** Scope restricting the assignment. */
    scope: RequestScopeSchemaV1.nullish().describe('Scope restricting the assignment.'),
    /** Date from which the assignment is valid. */
    validFrom: z.string().nullish().describe('Date from which the assignment is valid.'),
    /** Date until which the assignment is valid. */
    validTo: z.string().nullish().describe('Date until which the assignment is valid.'),
    /** Labels to attach to the assignment. */
    tags: z.array(z.string()).nullish().describe('Labels to attach to the assignment.'),
  })
  .describe('The body of an assign-access-role request.');

/**
 * Request body for assigning an access role to an account.
 *
 * Roles API 1.0 model inferred from {@link AssignAccessRoleRequestSchemaV1}, so
 * `AssignAccessRoleRequestV1` and the runtime validator can never describe different shapes.
 */
export type AssignAccessRoleRequestV1 = z.infer<typeof AssignAccessRoleRequestSchemaV1>;
