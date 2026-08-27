import { z } from 'zod';

/** Zod schema for the criteria selecting org-chart positions. */
export const OrgChartMatchCriteriaSchemaV1 = z
  .object({
    /** Selection strategy, for example `BasePositionId` or `ProjectDirector`. */
    match: z
      .string()
      .describe('Selection strategy, for example `BasePositionId` or `ProjectDirector`.'),
    /** Base position IDs to match when `match` is `BasePositionId`. */
    basePositionIds: z
      .array(z.string())
      .nullish()
      .describe('Base position IDs to match when `match` is `BasePositionId`.'),
  })
  .describe('The criteria selecting org-chart positions.');

/**
 * Criteria for selecting org chart positions to apply an OrgChart rule to.
 *
 * Roles API 1.0 model inferred from {@link OrgChartMatchCriteriaSchemaV1}, so
 * `OrgChartMatchCriteriaV1` and the runtime validator can never describe different shapes.
 */
export type OrgChartMatchCriteriaV1 = z.infer<typeof OrgChartMatchCriteriaSchemaV1>;
