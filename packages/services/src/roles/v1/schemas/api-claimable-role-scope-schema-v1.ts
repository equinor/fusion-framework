import { z } from 'zod';

/** Zod schema for the scope restricting a claimable-role assignment. */
export const ApiClaimableRoleScopeSchemaV1 = z
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
  .describe('The scope restricting a claimable-role assignment.');

/**
 * Scope restricting a claimable role assignment, if any. Omitted when the assignment is
 * unscoped.
 *
 * Roles API 1.0 model inferred from {@link ApiClaimableRoleScopeSchemaV1}, so
 * `ApiClaimableRoleScopeV1` and the runtime validator can never describe different shapes.
 */
export type ApiClaimableRoleScopeV1 = z.infer<typeof ApiClaimableRoleScopeSchemaV1>;
