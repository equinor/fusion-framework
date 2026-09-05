import { z } from 'zod';

/**
 * Zod schema for the `ApiTagAppBuild` model published by the Fusion Apps API 1.0.
 *
 * API response model for the GET /tags/{tagName}/app-builds endpoint. Represents a single app build
 * that is currently tagged with the requested tag.
 */
export const ApiTagAppBuildSchemaV1 = z
  .object({
    /** The internal unique identifier for the application. */
    appId: z.string().optional().describe('The internal unique identifier for the application.'),
    /** The unique short identifier (app key) for the application, e.g. my-app. */
    appKey: z
      .string()
      .nullish()
      .describe('The unique short identifier (app key) for the application, e.g. my-app.'),
    /** The internal unique identifier for this specific build. */
    buildId: z
      .string()
      .optional()
      .describe('The internal unique identifier for this specific build.'),
    /** The Git commit SHA that produced this build, e.g. abc1234. */
    commitSha: z
      .string()
      .nullish()
      .describe('The Git commit SHA that produced this build, e.g. abc1234.'),
    /** Human-readable display name for the application. */
    displayName: z.string().nullish().describe('Human-readable display name for the application.'),
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
    /** All tag names currently assigned to this build. */
    tags: z.array(z.string()).nullish().describe('All tag names currently assigned to this build.'),
    /** The Git commit timestamp for this build, if available. */
    timestamp: z
      .string()
      .nullish()
      .describe('The Git commit timestamp for this build, if available.'),
    /** The UTC date and time when this build was uploaded to the registry. */
    uploadedDate: z
      .string()
      .optional()
      .describe('The UTC date and time when this build was uploaded to the registry.'),
    /** Semantic version string of this build, e.g. 1.2.3. */
    version: z.string().nullish().describe('Semantic version string of this build, e.g. 1.2.3.'),
  })
  .describe(
    'API response model for the GET /tags/{tagName}/app-builds endpoint. Represents a single app build that is currently tagged with the requested tag.',
  );

/**
 * API response model for the GET /tags/{tagName}/app-builds endpoint. Represents a single app build
 * that is currently tagged with the requested tag.
 *
 * Apps API 1.0 model inferred from {@link ApiTagAppBuildSchemaV1}, so `ApiTagAppBuildV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiTagAppBuildV1 = z.infer<typeof ApiTagAppBuildSchemaV1>;
