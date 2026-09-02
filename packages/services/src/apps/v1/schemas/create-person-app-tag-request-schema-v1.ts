import { z } from 'zod';
import { PatchPropertyOfStringSchemaV1 } from './patch-property-of-string-schema-v1';

/**
 * Zod schema for the `CreatePersonAppTagRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to set or clear a personal tag on an app for a specific user.
 */
export const CreatePersonAppTagRequestSchemaV1 = z
  .object({
    /** Tag naming the build this person should receive. */
    tag: PatchPropertyOfStringSchemaV1.optional().describe(
      'Tag naming the build this person should receive.',
    ),
  })
  .describe('Request to set or clear a personal tag on an app for a specific user.');

/**
 * Request to set or clear a personal tag on an app for a specific user.
 *
 * Apps API 1.0 model inferred from {@link CreatePersonAppTagRequestSchemaV1}, so
 * `CreatePersonAppTagRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreatePersonAppTagRequestV1 = z.infer<typeof CreatePersonAppTagRequestSchemaV1>;
