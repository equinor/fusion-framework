import { z } from 'zod';

/** Zod schema for the scope restricting a role assignment request. */
export const RequestRoleScopeSchemaV1 = z
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
  .describe('The scope restricting a role assignment request.');

/**
 * Scope supplied when assigning a role, restricting where the assignment applies.
 *
 * Roles API 1.0 model inferred from {@link RequestRoleScopeSchemaV1}, so `RequestRoleScopeV1`
 * and the runtime validator can never describe different shapes.
 */
export type RequestRoleScopeV1 = z.infer<typeof RequestRoleScopeSchemaV1>;
