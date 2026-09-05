import { z } from 'zod';

/**
 * Zod schema for the `CreateWidgetTagRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to create a new version tag for a widget build.
 */
export const CreateWidgetTagRequestSchemaV1 = z
  .object({
    /** The semantic version string to tag, e.g. 1.2.3. */
    version: z.string().optional().describe('The semantic version string to tag, e.g. 1.2.3.'),
  })
  .describe('Request to create a new version tag for a widget build.');

/**
 * Request to create a new version tag for a widget build.
 *
 * Apps API 1.0 model inferred from {@link CreateWidgetTagRequestSchemaV1}, so
 * `CreateWidgetTagRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreateWidgetTagRequestV1 = z.infer<typeof CreateWidgetTagRequestSchemaV1>;
