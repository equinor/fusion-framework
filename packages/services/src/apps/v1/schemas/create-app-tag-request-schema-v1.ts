import { z } from 'zod';

/**
 * Zod schema for the `CreateAppTagRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to create a new version tag for an app build.
 */
export const CreateAppTagRequestSchemaV1 = z
  .object({
    /** The semantic version string to tag, e.g. 1.2.3. */
    version: z.string().optional().describe('The semantic version string to tag, e.g. 1.2.3.'),
  })
  .describe('Request to create a new version tag for an app build.');

/**
 * Request to create a new version tag for an app build.
 *
 * Apps API 1.0 model inferred from {@link CreateAppTagRequestSchemaV1}, so `CreateAppTagRequestV1`
 * and the runtime validator can never describe different shapes.
 */
export type CreateAppTagRequestV1 = z.infer<typeof CreateAppTagRequestSchemaV1>;
