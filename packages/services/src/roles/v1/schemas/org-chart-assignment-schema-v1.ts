import { z } from 'zod';
import { OrgChartAssignEntrySchemaV1 } from './org-chart-assign-entry-schema-v1';

/** Zod schema for the assignments produced when an org-chart rule matches. */
export const OrgChartAssignmentSchemaV1 = z
  .object({
    /** Roles assigned directly when the rule matches. */
    roles: z
      .array(OrgChartAssignEntrySchemaV1)
      .nullish()
      .describe('Roles assigned directly when the rule matches.'),
    /** Claimable roles offered when the rule matches. */
    claimableRoles: z
      .array(OrgChartAssignEntrySchemaV1)
      .nullish()
      .describe('Claimable roles offered when the rule matches.'),
  })
  .describe('The assignments produced when an org-chart rule matches.');

/**
 * Roles and claimable roles assigned when an OrgChart rule matches.
 *
 * Roles API 1.0 model inferred from {@link OrgChartAssignmentSchemaV1}, so
 * `OrgChartAssignmentV1` and the runtime validator can never describe different shapes.
 */
export type OrgChartAssignmentV1 = z.infer<typeof OrgChartAssignmentSchemaV1>;
