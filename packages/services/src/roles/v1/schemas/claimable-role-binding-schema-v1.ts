import { z } from 'zod';
import { ScopeBindingSchemaV1 } from './scope-binding-schema-v1';

/** Zod schema for a claimable role offered when an Entra group binding is reconciled. */
export const ClaimableRoleBindingSchemaV1 = z
  .object({
    /** Claimable role name to offer. */
    name: z.string().describe('Claimable role name to offer.'),
    /** Assignment type, either `Scoped` or `Global`. */
    type: z.string().nullish().describe('Assignment type, either `Scoped` or `Global`.'),
    /** Scope restriction applied to the assignment. */
    scope: ScopeBindingSchemaV1.optional().describe('Scope restriction applied to the assignment.'),
  })
  .describe('A claimable role offered when an Entra group binding is reconciled.');

/**
 * A claimable role to assign when the EntraGroup binding is reconciled.
 *
 * Roles API 1.0 model inferred from {@link ClaimableRoleBindingSchemaV1}, so
 * `ClaimableRoleBindingV1` and the runtime validator can never describe different shapes.
 */
export type ClaimableRoleBindingV1 = z.infer<typeof ClaimableRoleBindingSchemaV1>;
