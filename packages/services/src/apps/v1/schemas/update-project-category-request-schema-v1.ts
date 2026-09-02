import { z } from 'zod';

/**
 * Zod schema for the `UpdateProjectCategoryRequest` model published by the Fusion Apps API 1.0.
 *
 * Identifies a project category to associate with an app.
 */
export const UpdateProjectCategoryRequestSchemaV1 = z
  .object({
    /** The external identifier of the project category. */
    externalId: z.string().optional().describe('The external identifier of the project category.'),
  })
  .describe('Identifies a project category to associate with an app.');

/**
 * Identifies a project category to associate with an app.
 *
 * Apps API 1.0 model inferred from {@link UpdateProjectCategoryRequestSchemaV1}, so
 * `UpdateProjectCategoryRequestV1` and the runtime validator can never describe different shapes.
 */
export type UpdateProjectCategoryRequestV1 = z.infer<typeof UpdateProjectCategoryRequestSchemaV1>;
