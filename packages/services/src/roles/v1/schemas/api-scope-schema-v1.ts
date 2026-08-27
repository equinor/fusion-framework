import { z } from 'zod';

/** Zod schema for the scope attached to an access-role assignment. */
export const ApiScopeSchemaV1 = z
  .object({
    /** Scope type identifier (e.g. "project", "contract"), if any. */
    type: z
      .string()
      .nullish()
      .describe('Scope type identifier (e.g. "project", "contract"), if any.'),
    /** Whether this is a global (non-scoped) assignment. */
    isGlobal: z.boolean().describe('Whether this is a global (non-scoped) assignment.'),
    /** Scope value, if any. */
    value: z.string().nullable().describe('Scope value, if any.'),
  })
  .describe('The scope attached to an access-role assignment.');

/**
 * Scope restricting an access role assignment, if any. Omitted when the assignment is unscoped.
 *
 * Roles API 1.0 model inferred from {@link ApiScopeSchemaV1}, so `ApiScopeV1` and the runtime
 * validator can never describe different shapes.
 */
export type ApiScopeV1 = z.infer<typeof ApiScopeSchemaV1>;
