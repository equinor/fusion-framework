import type { z } from 'zod';
import { DataClassificationRequestSchemaV1 } from './data-classification-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfDataClassificationRequest` model published by the Fusion Apps
 * API 1.0.
 *
 * Updated data classification level for the app.
 */
export const PatchPropertyOfDataClassificationRequestSchemaV1 =
  DataClassificationRequestSchemaV1.nullable().describe(
    'Updated data classification level for the app.',
  );

/**
 * Updated data classification level for the app.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfDataClassificationRequestSchemaV1}, so
 * `PatchPropertyOfDataClassificationRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type PatchPropertyOfDataClassificationRequestV1 = z.infer<
  typeof PatchPropertyOfDataClassificationRequestSchemaV1
>;
