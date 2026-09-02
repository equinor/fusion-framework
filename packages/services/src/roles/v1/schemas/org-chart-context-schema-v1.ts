import { z } from 'zod';

/** Zod schema for the context controlling org-chart position resolution. */
export const OrgChartContextSchemaV1 = z
  .object({
    /** How the target project is resolved, `ProjectMaster` or `OrgProjectId`. */
    projectResolver: z
      .string()
      .nullish()
      .describe('How the target project is resolved, `ProjectMaster` or `OrgProjectId`.'),
    /** Whether positions parented by the director position count as PMT members. */
    allowLegacyPmtFallback: z
      .boolean()
      .optional()
      .describe('Whether positions parented by the director position count as PMT members.'),
    /** Org project IDs to restrict processing to. */
    orgProjectIds: z
      .array(z.string())
      .nullish()
      .describe('Org project IDs to restrict processing to.'),
  })
  .describe('The context controlling org-chart position resolution.');

/**
 * Optional context settings controlling how positions are resolved during OrgChart binding
 * reconciliation.
 *
 * Roles API 1.0 model inferred from {@link OrgChartContextSchemaV1}, so `OrgChartContextV1` and
 * the runtime validator can never describe different shapes.
 */
export type OrgChartContextV1 = z.infer<typeof OrgChartContextSchemaV1>;
