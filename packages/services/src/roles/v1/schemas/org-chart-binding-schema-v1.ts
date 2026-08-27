import { z } from 'zod';
import { OrgChartContextSchemaV1 } from './org-chart-context-schema-v1';
import { OrgChartProfileSchemaV1 } from './org-chart-profile-schema-v1';

/** Zod schema for an org-chart binding configuration payload. */
export const OrgChartBindingSchemaV1 = z
  .object({
    /** Binding schema version, for example `1.0`. */
    version: z.string().describe('Binding schema version, for example `1.0`.'),
    /** Context settings controlling position resolution. */
    context: OrgChartContextSchemaV1.nullish().describe(
      'Context settings controlling position resolution.',
    ),
    /** Reconciliation frequency, `nightly` or `hourly`. */
    syncInterval: z.string().nullish().describe('Reconciliation frequency, `nightly` or `hourly`.'),
    /** Profiles mapping positions to role assignments. */
    profiles: z
      .array(OrgChartProfileSchemaV1)
      .describe('Profiles mapping positions to role assignments.'),
  })
  .describe('An org-chart binding configuration payload.');

/**
 * Binding configuration for position-based org chart rules. Maps org chart positions to role
 * assignments via configurable profiles.
 *
 * Roles API 1.0 model inferred from {@link OrgChartBindingSchemaV1}, so `OrgChartBindingV1` and
 * the runtime validator can never describe different shapes.
 */
export type OrgChartBindingV1 = z.infer<typeof OrgChartBindingSchemaV1>;
