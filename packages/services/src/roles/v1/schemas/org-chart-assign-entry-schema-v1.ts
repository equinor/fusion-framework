import { z } from 'zod';
import { OrgChartScopeSchemaV1 } from './org-chart-scope-schema-v1';

/** Zod schema for a role or claimable role produced by a matching org-chart rule. */
export const OrgChartAssignEntrySchemaV1 = z
  .object({
    /** Role or claimable role name. */
    name: z.string().describe('Role or claimable role name.'),
    /** Assignment type, either `Scoped` or `Global`. */
    type: z.string().nullish().describe('Assignment type, either `Scoped` or `Global`.'),
    /** Scope applied to the produced assignment. */
    scope: OrgChartScopeSchemaV1.optional().describe('Scope applied to the produced assignment.'),
  })
  .describe('A role or claimable role produced by a matching org-chart rule.');

/**
 * A role or claimable-role assignment produced by a matching OrgChart rule.
 *
 * Roles API 1.0 model inferred from {@link OrgChartAssignEntrySchemaV1}, so
 * `OrgChartAssignEntryV1` and the runtime validator can never describe different shapes.
 */
export type OrgChartAssignEntryV1 = z.infer<typeof OrgChartAssignEntrySchemaV1>;
