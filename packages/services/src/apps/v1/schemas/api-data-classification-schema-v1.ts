import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';

/**
 * Zod schema for the `ApiDataClassification` model published by the Fusion Apps API 1.0.
 *
 * Data classification assigned to this application. if not yet classified.
 */
export const ApiDataClassificationSchemaV1 = z
  .object({
    /** A human-readable description of what the classification level means. */
    description: z
      .string()
      .nullish()
      .describe('A human-readable description of what the classification level means.'),
    /** A brief description of the impact of mishandling data at this classification level. */
    impact: z
      .string()
      .optional()
      .describe(
        'A brief description of the impact of mishandling data at this classification level.',
      ),
    /** The classification level name, e.g. Open, Internal, Confidential, StrictlyConfidential. */
    level: z
      .string()
      .optional()
      .describe(
        'The classification level name, e.g. Open, Internal, Confidential, StrictlyConfidential.',
      ),
    /** The rationale provided when this classification was assigned to the application. */
    reason: z
      .string()
      .nullish()
      .describe('The rationale provided when this classification was assigned to the application.'),
    /** The UTC date and time when this classification was last updated. */
    updatedAt: z
      .string()
      .optional()
      .describe('The UTC date and time when this classification was last updated.'),
    /** Account that last changed the classification, if any. */
    updatedBy: ApiAccountSchemaV1.optional().describe(
      'Account that last changed the classification, if any.',
    ),
  })
  .describe('Data classification assigned to this application. if not yet classified.');

/**
 * Data classification assigned to this application. if not yet classified.
 *
 * Apps API 1.0 model inferred from {@link ApiDataClassificationSchemaV1}, so
 * `ApiDataClassificationV1` and the runtime validator can never describe different shapes.
 */
export type ApiDataClassificationV1 = z.infer<typeof ApiDataClassificationSchemaV1>;
