import type { z } from 'zod';
import { PatchAppVisualizationRequestSchemaV1 } from './patch-app-visualization-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfPatchAppVisualizationRequest` model published by the Fusion
 * Apps API 1.0.
 *
 * Updated visual appearance settings for the app.
 */
export const PatchPropertyOfPatchAppVisualizationRequestSchemaV1 =
  PatchAppVisualizationRequestSchemaV1.nullable().describe(
    'Updated visual appearance settings for the app.',
  );

/**
 * Updated visual appearance settings for the app.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfPatchAppVisualizationRequestSchemaV1}, so
 * `PatchPropertyOfPatchAppVisualizationRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type PatchPropertyOfPatchAppVisualizationRequestV1 = z.infer<
  typeof PatchPropertyOfPatchAppVisualizationRequestSchemaV1
>;
