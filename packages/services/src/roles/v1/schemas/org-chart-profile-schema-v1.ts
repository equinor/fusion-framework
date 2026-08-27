import { z } from 'zod';
import { OrgChartRuleSchemaV1 } from './org-chart-rule-schema-v1';

/** Zod schema for a named collection of org-chart rules. */
export const OrgChartProfileSchemaV1 = z
  .object({
    /** Human-readable label used in diagnostics and audit. */
    name: z.string().describe('Human-readable label used in diagnostics and audit.'),
    /** Rules evaluated independently within this profile. */
    rules: z
      .array(OrgChartRuleSchemaV1)
      .optional()
      .describe('Rules evaluated independently within this profile.'),
  })
  .describe('A named collection of org-chart rules.');

/**
 * A named collection of OrgChart rules evaluated independently during binding reconciliation.
 *
 * Roles API 1.0 model inferred from {@link OrgChartProfileSchemaV1}, so `OrgChartProfileV1` and
 * the runtime validator can never describe different shapes.
 */
export type OrgChartProfileV1 = z.infer<typeof OrgChartProfileSchemaV1>;
