import type { z } from 'zod';
import { AppCategoryIdentifierSchemaV1 } from './app-category-identifier-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfAppCategoryIdentifier` model published by the Fusion Apps API
 * 1.0.
 *
 * The category the app belongs to. Set to null to remove the category assignment.
 */
export const PatchPropertyOfAppCategoryIdentifierSchemaV1 =
  AppCategoryIdentifierSchemaV1.nullable().describe(
    'The category the app belongs to. Set to null to remove the category assignment.',
  );

/**
 * The category the app belongs to. Set to null to remove the category assignment.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfAppCategoryIdentifierSchemaV1}, so
 * `PatchPropertyOfAppCategoryIdentifierV1` and the runtime validator can never describe different
 * shapes.
 */
export type PatchPropertyOfAppCategoryIdentifierV1 = z.infer<
  typeof PatchPropertyOfAppCategoryIdentifierSchemaV1
>;
