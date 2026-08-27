import { z } from 'zod';
import { ScopeBindingSchemaV1 } from './scope-binding-schema-v1';

/** Zod schema for a role assigned when an Entra group binding is reconciled. */
export const RoleBindingSchemaV1 = z
  .object({
    /** Role name to assign. */
    name: z.string().describe('Role name to assign.'),
    /** Assignment type, either `Scoped` or `Global`. */
    type: z.string().nullish().describe('Assignment type, either `Scoped` or `Global`.'),
    /** Scope restriction applied to the assignment. */
    scope: ScopeBindingSchemaV1.optional().describe('Scope restriction applied to the assignment.'),
  })
  .describe('A role assigned when an Entra group binding is reconciled.');

/**
 * A role to assign when the EntraGroup binding is reconciled.
 *
 * Roles API 1.0 model inferred from {@link RoleBindingSchemaV1}, so `RoleBindingV1` and the
 * runtime validator can never describe different shapes.
 */
export type RoleBindingV1 = z.infer<typeof RoleBindingSchemaV1>;
