import { z } from 'zod';
import { OrgChartAssignmentSchemaV1 } from './org-chart-assignment-schema-v1';
import { OrgChartMatchCriteriaSchemaV1 } from './org-chart-match-criteria-schema-v1';

/** Zod schema for a single org-chart rule. */
export const OrgChartRuleSchemaV1 = z
  .object({
    /** Criteria selecting the positions the rule applies to. */
    when: OrgChartMatchCriteriaSchemaV1.describe(
      'Criteria selecting the positions the rule applies to.',
    ),
    /** Assignments produced when the criteria match. */
    assign: OrgChartAssignmentSchemaV1.describe('Assignments produced when the criteria match.'),
  })
  .describe('A single org-chart rule.');

/**
 * A single matching rule within an OrgChart profile.
 *
 * Roles API 1.0 model inferred from {@link OrgChartRuleSchemaV1}, so `OrgChartRuleV1` and the
 * runtime validator can never describe different shapes.
 */
export type OrgChartRuleV1 = z.infer<typeof OrgChartRuleSchemaV1>;
