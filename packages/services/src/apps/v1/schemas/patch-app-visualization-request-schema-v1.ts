import { z } from 'zod';
import { PatchPropertyOfShortSchemaV1 } from './patch-property-of-short-schema-v1';
import { PatchPropertyOfStringSchemaV1 } from './patch-property-of-string-schema-v1';

/**
 * Zod schema for the `PatchAppVisualizationRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to partially update the visual appearance of an app. Only fields that are explicitly set
 * will be applied.
 */
export const PatchAppVisualizationRequestSchemaV1 = z
  .object({
    /** Presentation colour of the application. */
    color: PatchPropertyOfStringSchemaV1.optional().describe(
      'Presentation colour of the application.',
    ),
    /** Presentation icon of the application. */
    icon: PatchPropertyOfStringSchemaV1.optional().describe(
      'Presentation icon of the application.',
    ),
    /** Sort order used when the application is listed. */
    sortOrder: PatchPropertyOfShortSchemaV1.optional().describe(
      'Sort order used when the application is listed.',
    ),
  })
  .describe(
    'Request to partially update the visual appearance of an app. Only fields that are explicitly set will be applied.',
  );

/**
 * Request to partially update the visual appearance of an app. Only fields that are explicitly set
 * will be applied.
 *
 * Apps API 1.0 model inferred from {@link PatchAppVisualizationRequestSchemaV1}, so
 * `PatchAppVisualizationRequestV1` and the runtime validator can never describe different shapes.
 */
export type PatchAppVisualizationRequestV1 = z.infer<typeof PatchAppVisualizationRequestSchemaV1>;
