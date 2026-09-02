import { z } from 'zod';

/**
 * Zod schema for the `ApiAppVisualization` model published by the Fusion Apps API 1.0.
 *
 * Visualization settings (icon and accent colour) for this application.
 */
export const ApiAppVisualizationSchemaV1 = z
  .object({
    /** Accent colour for the app tile, expressed as a CSS colour string (e.g. #0084C4). when using the category default. */
    color: z
      .string()
      .nullish()
      .describe(
        'Accent colour for the app tile, expressed as a CSS colour string (e.g. #0084C4). when using the category default.',
      ),
    /** Icon identifier for the app tile. when using the category default icon. */
    icon: z
      .string()
      .nullish()
      .describe('Icon identifier for the app tile. when using the category default icon.'),
    /** Determines the display position of this application within its category; lower values appear first. */
    sortOrder: z
      .union([z.number(), z.string()])
      .optional()
      .describe(
        'Determines the display position of this application within its category; lower values appear first.',
      ),
  })
  .describe('Visualization settings (icon and accent colour) for this application.');

/**
 * Visualization settings (icon and accent colour) for this application.
 *
 * Apps API 1.0 model inferred from {@link ApiAppVisualizationSchemaV1}, so `ApiAppVisualizationV1`
 * and the runtime validator can never describe different shapes.
 */
export type ApiAppVisualizationV1 = z.infer<typeof ApiAppVisualizationSchemaV1>;
