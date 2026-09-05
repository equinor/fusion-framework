import { z } from 'zod';
import { UpdateProjectCategoryRequestSchemaV1 } from './update-project-category-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfListOfUpdateProjectCategoryRequest` model published by the
 * Fusion Apps API 1.0.
 *
 * Updated list of project categories the app supports.
 */
export const PatchPropertyOfListOfUpdateProjectCategoryRequestSchemaV1 = z
  .array(UpdateProjectCategoryRequestSchemaV1)
  .nullable()
  .describe('Updated list of project categories the app supports.');

/**
 * Updated list of project categories the app supports.
 *
 * Apps API 1.0 model inferred from
 * {@link PatchPropertyOfListOfUpdateProjectCategoryRequestSchemaV1}, so
 * `PatchPropertyOfListOfUpdateProjectCategoryRequestV1` and the runtime validator can never
 * describe different shapes.
 */
export type PatchPropertyOfListOfUpdateProjectCategoryRequestV1 = z.infer<
  typeof PatchPropertyOfListOfUpdateProjectCategoryRequestSchemaV1
>;
