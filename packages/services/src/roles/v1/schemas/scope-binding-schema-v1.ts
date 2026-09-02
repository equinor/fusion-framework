import { z } from 'zod';

/** Zod schema for the scope restriction applied by a role binding. */
export const ScopeBindingSchemaV1 = z
  .object({
    /** Scope type identifier, for example `project` or `contract`. */
    scopeTypeIdentifier: z
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
  .describe('The scope restriction applied by a role binding.');

/**
 * Scope restriction for a role or claimable-role assignment.
 *
 * Roles API 1.0 model inferred from {@link ScopeBindingSchemaV1}, so `ScopeBindingV1` and the
 * runtime validator can never describe different shapes.
 */
export type ScopeBindingV1 = z.infer<typeof ScopeBindingSchemaV1>;
