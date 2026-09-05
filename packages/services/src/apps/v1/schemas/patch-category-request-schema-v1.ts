import { z } from 'zod';
import { PatchPropertyOfShortSchemaV1 } from './patch-property-of-short-schema-v1';
import { PatchPropertyOfStringSchemaV1 } from './patch-property-of-string-schema-v1';

/**
 * Zod schema for the `PatchCategoryRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to partially update an app category. Only fields that are explicitly set will be applied.
 */
export const PatchCategoryRequestSchemaV1 = z
  .object({
    /** Presentation colour of the category. */
    color: PatchPropertyOfStringSchemaV1.optional().describe(
      'Presentation colour of the category.',
    ),
    /** Icon used by apps in the category that define none. */
    defaultIcon: PatchPropertyOfStringSchemaV1.optional().describe(
      'Icon used by apps in the category that define none.',
    ),
    /** Display name of the category. */
    displayName: PatchPropertyOfStringSchemaV1.optional().describe('Display name of the category.'),
    /** Sort order used when categories are listed. */
    sortOrder: PatchPropertyOfShortSchemaV1.optional().describe(
      'Sort order used when categories are listed.',
    ),
  })
  .describe(
    'Request to partially update an app category. Only fields that are explicitly set will be applied.',
  );

/**
 * Request to partially update an app category. Only fields that are explicitly set will be applied.
 *
 * Apps API 1.0 model inferred from {@link PatchCategoryRequestSchemaV1}, so
 * `PatchCategoryRequestV1` and the runtime validator can never describe different shapes.
 */
export type PatchCategoryRequestV1 = z.infer<typeof PatchCategoryRequestSchemaV1>;
