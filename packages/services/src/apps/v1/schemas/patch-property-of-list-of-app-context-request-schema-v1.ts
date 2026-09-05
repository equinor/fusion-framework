import { z } from 'zod';
import { AppContextRequestSchemaV1 } from './app-context-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfListOfAppContextRequest` model published by the Fusion Apps
 * API 1.0.
 *
 * The context types the app supports. Set to null to support all contexts.
 */
export const PatchPropertyOfListOfAppContextRequestSchemaV1 = z
  .array(AppContextRequestSchemaV1)
  .nullable()
  .describe('The context types the app supports. Set to null to support all contexts.');

/**
 * The context types the app supports. Set to null to support all contexts.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfListOfAppContextRequestSchemaV1}, so
 * `PatchPropertyOfListOfAppContextRequestV1` and the runtime validator can never describe different
 * shapes.
 */
export type PatchPropertyOfListOfAppContextRequestV1 = z.infer<
  typeof PatchPropertyOfListOfAppContextRequestSchemaV1
>;
