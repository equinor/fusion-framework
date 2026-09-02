import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';

/**
 * Zod schema for the `ApiAppVersion` model published by the Fusion Apps API 1.0.
 *
 * The currently active build (version) for this application. if no build has been published.
 */
export const ApiAppVersionSchemaV1 = z
  .object({
    /** Arbitrary JSON annotations attached to this build at upload time. */
    annotations: z
      .record(z.string(), z.string())
      .optional()
      .describe('Arbitrary JSON annotations attached to this build at upload time.'),
    /** Relative URL path to the bundle assets for this build version. */
    assetPath: z
      .string()
      .nullish()
      .describe('Relative URL path to the bundle assets for this build version.'),
    /** The Git commit SHA that produced this build, e.g. abc1234. */
    commitSha: z
      .string()
      .nullish()
      .describe('The Git commit SHA that produced this build, e.g. abc1234.'),
    /** Relative URL to retrieve the runtime configuration for this build version. */
    configUrl: z
      .string()
      .nullish()
      .describe('Relative URL to retrieve the runtime configuration for this build version.'),
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
    /** Per-build app configuration options used by consumers such as Fusion Framework (e.g. context routing strategy, feature flags). Serves as a generic per-build configuration store for any options needed by the app. */
    options: z
      .record(z.string(), z.unknown())
      .nullish()
      .describe(
        'Per-build app configuration options used by consumers such as Fusion Framework (e.g. context routing strategy, feature flags). Serves as a generic per-build configuration store for any options needed by the app.',
      ),
    /** URL to the project page or documentation for this application build. */
    projectPage: z
      .string()
      .nullish()
      .describe('URL to the project page or documentation for this application build.'),
    /** The primary tag name for this build, e.g. latest. if no tag is assigned. */
    tag: z
      .string()
      .nullish()
      .describe('The primary tag name for this build, e.g. latest. if no tag is assigned.'),
    /** All tag names (e.g. latest, preview) currently pointing to this build. */
    tags: z
      .array(z.string())
      .nullish()
      .describe('All tag names (e.g. latest, preview) currently pointing to this build.'),
    /** The Git commit timestamp for this build, if available. */
    timestamp: z
      .string()
      .nullish()
      .describe('The Git commit timestamp for this build, if available.'),
    /** Account that uploaded the build. */
    uploadedBy: ApiAccountSchemaV1.nullish().describe('Account that uploaded the build.'),
    /** The UTC date and time when this build was uploaded to the registry. */
    uploadedDate: z
      .string()
      .optional()
      .describe('The UTC date and time when this build was uploaded to the registry.'),
    /** Semantic version string of this build, e.g. 1.2.3. */
    version: z.string().nullish().describe('Semantic version string of this build, e.g. 1.2.3.'),
  })
  .describe(
    'The currently active build (version) for this application. if no build has been published.',
  );

/**
 * The currently active build (version) for this application. if no build has been published.
 *
 * Apps API 1.0 model inferred from {@link ApiAppVersionSchemaV1}, so `ApiAppVersionV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiAppVersionV1 = z.infer<typeof ApiAppVersionSchemaV1>;
