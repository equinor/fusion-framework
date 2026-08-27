import { z } from 'zod';

/** Zod schema for the scope applied to an org-chart binding assignment. */
export const OrgChartScopeSchemaV1 = z
  .object({
    /** Scope type, for example `project`, `contract`, or `system`. */
    scopeTypeIdentifier: z
      .string()
      .describe('Scope type, for example `project`, `contract`, or `system`.'),
    /** Template for the scope value, supporting placeholders such as `{orgProjectId}`. */
    valueTemplate: z
      .string()
      .describe('Template for the scope value, supporting placeholders such as `{orgProjectId}`.'),
    /** Whether the assignment applies globally rather than to a scope value. */
    isGlobal: z
      .boolean()
      .optional()
      .describe('Whether the assignment applies globally rather than to a scope value.'),
  })
  .describe('The scope applied to an org-chart binding assignment.');

/**
 * Scope applied to a role or claimable-role assignment produced by the OrgChart binding.
 *
 * Roles API 1.0 model inferred from {@link OrgChartScopeSchemaV1}, so `OrgChartScopeV1` and the
 * runtime validator can never describe different shapes.
 */
export type OrgChartScopeV1 = z.infer<typeof OrgChartScopeSchemaV1>;
