import { z } from 'zod';

/**
 * Zod schema for the `ApiWidgetTag` model published by the Fusion Apps API 1.0.
 *
 * Represents a named tag and the widget build version it currently points to. Tags such as latest
 * or preview provide stable aliases for specific build versions.
 */
export const ApiWidgetTagSchemaV1 = z
  .object({
    /** The tag name, e.g. latest or preview. */
    tagName: z.string().nullish().describe('The tag name, e.g. latest or preview.'),
    /** The version string of the build this tag currently points to, e.g. 1.2.3. */
    version: z
      .string()
      .nullish()
      .describe('The version string of the build this tag currently points to, e.g. 1.2.3.'),
  })
  .describe(
    'Represents a named tag and the widget build version it currently points to. Tags such as latest or preview provide stable aliases for specific build versions.',
  );

/**
 * Represents a named tag and the widget build version it currently points to. Tags such as latest
 * or preview provide stable aliases for specific build versions.
 *
 * Apps API 1.0 model inferred from {@link ApiWidgetTagSchemaV1}, so `ApiWidgetTagV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiWidgetTagV1 = z.infer<typeof ApiWidgetTagSchemaV1>;
