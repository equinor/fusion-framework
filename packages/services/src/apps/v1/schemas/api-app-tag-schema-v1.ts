import { z } from 'zod';

/**
 * Zod schema for the `ApiAppTag` model published by the Fusion Apps API 1.0.
 *
 * Represents a named tag and the application build version it currently points to. Tags such as
 * latest or preview provide stable aliases for specific build versions.
 */
export const ApiAppTagSchemaV1 = z
  .object({
    /** The tag name, e.g. latest or preview. */
    tagName: z.string().nullish().describe('The tag name, e.g. latest or preview.'),
    /** The semantic version string of the build this tag currently points to, e.g. 1.2.3. */
    version: z
      .string()
      .nullish()
      .describe(
        'The semantic version string of the build this tag currently points to, e.g. 1.2.3.',
      ),
  })
  .describe(
    'Represents a named tag and the application build version it currently points to. Tags such as latest or preview provide stable aliases for specific build versions.',
  );

/**
 * Represents a named tag and the application build version it currently points to. Tags such as
 * latest or preview provide stable aliases for specific build versions.
 *
 * Apps API 1.0 model inferred from {@link ApiAppTagSchemaV1}, so `ApiAppTagV1` and the runtime
 * validator can never describe different shapes.
 */
export type ApiAppTagV1 = z.infer<typeof ApiAppTagSchemaV1>;
