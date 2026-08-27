import { z } from 'zod';

/** Zod schema for the scope restricting an access-role assignment request. */
export const RequestScopeSchemaV1 = z
  .object({
    /** Scope type identifier, for example `project` or `contract`. */
    type: z
      .string()
      .nullish()
      .describe('Scope type identifier, for example `project` or `contract`.'),
    /** Whether the assignment applies globally rather than to a scope value. */
    isGlobal: z
      .boolean()
      .nullish()
      .describe('Whether the assignment applies globally rather than to a scope value.'),
    /** Scope value the assignment is restricted to. */
    value: z.string().nullish().describe('Scope value the assignment is restricted to.'),
  })
  .describe('The scope restricting an access-role assignment request.');

/**
 * Scope supplied when assigning a system access role, restricting where the assignment applies.
 *
 * Roles API 1.0 model inferred from {@link RequestScopeSchemaV1}, so `RequestScopeV1` and the
 * runtime validator can never describe different shapes.
 */
export type RequestScopeV1 = z.infer<typeof RequestScopeSchemaV1>;
