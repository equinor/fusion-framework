import { z } from 'zod';

/** Zod schema for the scope restricting a claimable-role assignment request. */
export const RequestClaimableRoleScopeSchemaV1 = z
  .object({
    /** Scope type ID or name the assignment is restricted to. */
    scopeTypeIdentifier: z
      .string()
      .nullish()
      .describe('Scope type ID or name the assignment is restricted to.'),
    /** Whether the assignment applies globally rather than to a scope value. */
    isGlobal: z
      .boolean()
      .nullish()
      .describe('Whether the assignment applies globally rather than to a scope value.'),
    /** Scope value the assignment is restricted to. */
    value: z.string().nullish().describe('Scope value the assignment is restricted to.'),
  })
  .describe('The scope restricting a claimable-role assignment request.');

/**
 * Scope supplied when assigning a claimable role, restricting where the assignment applies.
 *
 * Roles API 1.0 model inferred from {@link RequestClaimableRoleScopeSchemaV1}, so
 * `RequestClaimableRoleScopeV1` and the runtime validator can never describe different shapes.
 */
export type RequestClaimableRoleScopeV1 = z.infer<typeof RequestClaimableRoleScopeSchemaV1>;
