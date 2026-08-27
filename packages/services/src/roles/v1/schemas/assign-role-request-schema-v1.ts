import { z } from 'zod';
import { RequestRoleScopeSchemaV1 } from './request-role-scope-schema-v1';

/** Zod schema for the body of an assign-role request. */
export const AssignRoleRequestSchemaV1 = z
  .object({
    /** Mail or Azure unique ID of the account to assign the role to. */
    accountIdentifier: z
      .string()
      .optional()
      .describe('Mail or Azure unique ID of the account to assign the role to.'),
    /** Origin system creating this assignment. */
    source: z.string().nullish().describe('Origin system creating this assignment.'),
    /** Identifier of the assignment in the originating system. */
    externalIdentifier: z
      .string()
      .nullish()
      .describe('Identifier of the assignment in the originating system.'),
    /** Reason for the assignment. */
    reason: z.string().optional().describe('Reason for the assignment.'),
    /** Assignment type, either `Direct` or `Inherited`. */
    type: z.string().nullish().describe('Assignment type, either `Direct` or `Inherited`.'),
    /** Scope restricting the assignment. */
    scope: RequestRoleScopeSchemaV1.nullish().describe('Scope restricting the assignment.'),
    /** Date from which the assignment is valid. */
    validFrom: z.string().nullish().describe('Date from which the assignment is valid.'),
    /** Date until which the assignment is valid. */
    validTo: z.string().nullish().describe('Date until which the assignment is valid.'),
    /** Labels to attach to the assignment. */
    tags: z.array(z.string()).nullish().describe('Labels to attach to the assignment.'),
  })
  .describe('The body of an assign-role request.');

/**
 * Request body for assigning a role to an account.
 *
 * Roles API 1.0 model inferred from {@link AssignRoleRequestSchemaV1}, so `AssignRoleRequestV1`
 * and the runtime validator can never describe different shapes.
 */
export type AssignRoleRequestV1 = z.infer<typeof AssignRoleRequestSchemaV1>;
