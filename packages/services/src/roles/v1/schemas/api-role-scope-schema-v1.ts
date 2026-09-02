import { z } from 'zod';

/** Zod schema for the scope restricting a permanent role assignment. */
export const ApiRoleScopeSchemaV1 = z
  .object({
    /** Whether this is a global (non-scoped) assignment. */
    isGlobal: z.boolean().describe('Whether this is a global (non-scoped) assignment.'),
    /** Scope value, if any. */
    value: z.string().nullable().describe('Scope value, if any.'),
    /** Scope type identifier (e.g. "project", "contract"), if any. */
    scopeTypeIdentifier: z
      .string()
      .nullish()
      .describe('Scope type identifier (e.g. "project", "contract"), if any.'),
  })
  .describe('The scope restricting a permanent role assignment.');

/**
 * Scope restricting a role assignment, if any. Omitted when the assignment is unscoped.
 *
 * Roles API 1.0 model inferred from {@link ApiRoleScopeSchemaV1}, so `ApiRoleScopeV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiRoleScopeV1 = z.infer<typeof ApiRoleScopeSchemaV1>;
