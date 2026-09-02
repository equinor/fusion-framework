import { z } from 'zod';

/**
 * Zod schema for the `ApiWidgetVersion` model published by the Fusion Apps API 1.0.
 *
 * The currently active build (version) for this widget. if no build has been published.
 */
export const ApiWidgetVersionSchemaV1 = z
  .object({
    /** Arbitrary JSON annotations attached to this build at upload time. */
    annotations: z
      .record(z.string(), z.string())
      .optional()
      .describe('Arbitrary JSON annotations attached to this build at upload time.'),
    /** Relative URL path to the bundle assets for this widget build version. */
    assetPath: z
      .string()
      .nullish()
      .describe('Relative URL path to the bundle assets for this widget build version.'),
    /** The Git commit SHA that produced this build, e.g. abc1234. */
    commitSha: z
      .string()
      .nullish()
      .describe('The Git commit SHA that produced this build, e.g. abc1234.'),
    /** Relative URL to retrieve the runtime configuration for this widget build version. */
    configUrl: z
      .string()
      .nullish()
      .describe(
        'Relative URL to retrieve the runtime configuration for this widget build version.',
      ),
    /** The module entry point path within the bundle, e.g. index.js. */
    entryPoint: z
      .string()
      .nullish()
      .describe('The module entry point path within the bundle, e.g. index.js.'),
    /** The GitHub repository URL where the source code for this build lives. */
    githubRepo: z
      .string()
      .nullish()
      .describe('The GitHub repository URL where the source code for this build lives.'),
    /** The primary tag name for this build, e.g. latest. if no tag is assigned. */
    tag: z
      .string()
      .nullish()
      .describe('The primary tag name for this build, e.g. latest. if no tag is assigned.'),
    /** The Git commit timestamp for this build, if available. */
    timestamp: z
      .string()
      .nullish()
      .describe('The Git commit timestamp for this build, if available.'),
    /** Semantic version string of this build, e.g. 1.2.3. */
    version: z.string().nullish().describe('Semantic version string of this build, e.g. 1.2.3.'),
  })
  .describe(
    'The currently active build (version) for this widget. if no build has been published.',
  );

/**
 * The currently active build (version) for this widget. if no build has been published.
 *
 * Apps API 1.0 model inferred from {@link ApiWidgetVersionSchemaV1}, so `ApiWidgetVersionV1` and
 * the runtime validator can never describe different shapes.
 */
export type ApiWidgetVersionV1 = z.infer<typeof ApiWidgetVersionSchemaV1>;
