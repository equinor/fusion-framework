import { z } from 'zod';

/**
 * Zod schema for the `ApiAppCompliance` model published by the Fusion Apps API 1.0.
 *
 * An active application compliance finding (severity and message).
 */
export const ApiAppComplianceSchemaV1 = z
  .object({
    /** Stable Apps-owned trigger code, e.g. "app-never-published". */
    code: z
      .string()
      .optional()
      .describe('Stable Apps-owned trigger code, e.g. "app-never-published".'),
    /** Human-readable explanation of the compliance finding. */
    description: z
      .string()
      .optional()
      .describe('Human-readable explanation of the compliance finding.'),
    /** UI grouping area: "setup", "governance", "access", or "ownership". */
    section: z
      .string()
      .optional()
      .describe('UI grouping area: "setup", "governance", "access", or "ownership".'),
    /** "Recommended", "Warning", or "Critical". */
    severity: z.string().optional().describe('"Recommended", "Warning", or "Critical".'),
    /** Short title of the compliance finding. */
    title: z.string().optional().describe('Short title of the compliance finding.'),
    /** "Fix" or "Learn". */
    type: z.string().optional().describe('"Fix" or "Learn".'),
  })
  .describe('An active application compliance finding (severity and message).');

/**
 * An active application compliance finding (severity and message).
 *
 * Apps API 1.0 model inferred from {@link ApiAppComplianceSchemaV1}, so `ApiAppComplianceV1` and
 * the runtime validator can never describe different shapes.
 */
export type ApiAppComplianceV1 = z.infer<typeof ApiAppComplianceSchemaV1>;
