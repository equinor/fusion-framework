import { z } from 'zod';

/**
 * Zod schema for the `ApiAppComplianceSummary` model published by the Fusion Apps API 1.0.
 *
 * Summary of active compliance findings for this application. if none are active.
 */
export const ApiAppComplianceSummarySchemaV1 = z
  .object({
    /** Number of critical findings currently open. */
    criticalCount: z
      .union([z.number(), z.string()])
      .optional()
      .describe('Number of critical findings currently open.'),
    /** "Recommended", "Warning", "Critical", or when there are no active findings. */
    highestSeverity: z
      .string()
      .nullish()
      .describe('"Recommended", "Warning", "Critical", or when there are no active findings.'),
    /** Number of recommendation findings currently open. */
    recommendedCount: z
      .union([z.number(), z.string()])
      .optional()
      .describe('Number of recommendation findings currently open.'),
    /** Total number of findings currently open. */
    totalCount: z
      .union([z.number(), z.string()])
      .optional()
      .describe('Total number of findings currently open.'),
    /** Number of warning findings currently open. */
    warningCount: z
      .union([z.number(), z.string()])
      .optional()
      .describe('Number of warning findings currently open.'),
  })
  .describe('Summary of active compliance findings for this application. if none are active.');

/**
 * Summary of active compliance findings for this application. if none are active.
 *
 * Apps API 1.0 model inferred from {@link ApiAppComplianceSummarySchemaV1}, so
 * `ApiAppComplianceSummaryV1` and the runtime validator can never describe different shapes.
 */
export type ApiAppComplianceSummaryV1 = z.infer<typeof ApiAppComplianceSummarySchemaV1>;
