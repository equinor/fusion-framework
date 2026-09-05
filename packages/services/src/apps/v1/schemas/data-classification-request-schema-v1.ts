import { z } from 'zod';

/**
 * Zod schema for the `DataClassificationRequest` model published by the Fusion Apps API 1.0.
 *
 * Represents the data classification level assigned to an app.
 */
export const DataClassificationRequestSchemaV1 = z
  .object({
    /** The classification level, e.g. Open, Internal, or Confidential. */
    level: z
      .string()
      .optional()
      .describe('The classification level, e.g. Open, Internal, or Confidential.'),
    /** The reason for classifying the app as Confidential. Required when is Confidential. */
    reason: z
      .string()
      .nullish()
      .describe(
        'The reason for classifying the app as Confidential. Required when is Confidential.',
      ),
  })
  .describe('Represents the data classification level assigned to an app.');

/**
 * Represents the data classification level assigned to an app.
 *
 * Apps API 1.0 model inferred from {@link DataClassificationRequestSchemaV1}, so
 * `DataClassificationRequestV1` and the runtime validator can never describe different shapes.
 */
export type DataClassificationRequestV1 = z.infer<typeof DataClassificationRequestSchemaV1>;
