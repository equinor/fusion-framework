import { z } from 'zod';

/** Zod schema for resolved scope values attached to an active access-role assignment. */
export const ApiScopeValuesSchemaV1 = z
  .object({
    /** Scope type identifier (e.g. "project", "contract"), if any. */
    type: z
      .string()
      .nullish()
      .describe('Scope type identifier (e.g. "project", "contract"), if any.'),
    /** Whether the assignment is global (not restricted to a specific entity). */
    isGlobal: z
      .boolean()
      .optional()
      .describe('Whether the assignment is global (not restricted to a specific entity).'),
    /** Resolved scope values (e.g. project IDs or contract IDs), if any. */
    values: z
      .array(z.string())
      .nullable()
      .describe('Resolved scope values (e.g. project IDs or contract IDs), if any.'),
  })
  .describe('Resolved scope values attached to an active access-role assignment.');

/**
 * Scope values resolved for an assignment, if the assignment is scoped.
 *
 * Roles API 1.0 model inferred from {@link ApiScopeValuesSchemaV1}, so `ApiScopeValuesV1` and
 * the runtime validator can never describe different shapes.
 */
export type ApiScopeValuesV1 = z.infer<typeof ApiScopeValuesSchemaV1>;
