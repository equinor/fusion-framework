import { z } from 'zod';

/**
 * Zod schema for the `AppVisualization` model published by the Fusion Apps API 1.0.
 *
 * Optional visual appearance settings for the app.
 */
export const AppVisualizationSchemaV1 = z
  .object({
    /** The display color for the app, e.g. a hex color code. */
    color: z.string().nullish().describe('The display color for the app, e.g. a hex color code.'),
    /** The icon identifier used to represent the app. */
    icon: z.string().nullish().describe('The icon identifier used to represent the app.'),
    /** The sort order that controls the app's position in lists. */
    sortOrder: z
      .union([z.number(), z.string()])
      .nullish()
      .describe("The sort order that controls the app's position in lists."),
  })
  .describe('Optional visual appearance settings for the app.');

/**
 * Optional visual appearance settings for the app.
 *
 * Apps API 1.0 model inferred from {@link AppVisualizationSchemaV1}, so `AppVisualizationV1` and
 * the runtime validator can never describe different shapes.
 */
export type AppVisualizationV1 = z.infer<typeof AppVisualizationSchemaV1>;
