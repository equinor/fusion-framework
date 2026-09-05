import { z } from 'zod';
import { PatchPropertyOfAccountIdentifierSchemaV1 } from './patch-property-of-account-identifier-schema-v1';
import { PatchPropertyOfStringSchemaV1 } from './patch-property-of-string-schema-v1';

/**
 * Zod schema for the `PatchTechnologyProductRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to partially update a technology product. Only fields that are explicitly set will be
 * applied.
 */
export const PatchTechnologyProductRequestSchemaV1 = z
  .object({
    /** Account owning the product from the business side. */
    businessSolutionOwner: PatchPropertyOfAccountIdentifierSchemaV1.optional().describe(
      'Account owning the product from the business side.',
    ),
    /** Description of the technology product. */
    description: PatchPropertyOfStringSchemaV1.optional().describe(
      'Description of the technology product.',
    ),
    /** Name of the technology product. */
    name: PatchPropertyOfStringSchemaV1.optional().describe('Name of the technology product.'),
    /** Account managing the technology product. */
    technicalProductManager: PatchPropertyOfAccountIdentifierSchemaV1.optional().describe(
      'Account managing the technology product.',
    ),
  })
  .describe(
    'Request to partially update a technology product. Only fields that are explicitly set will be applied.',
  );

/**
 * Request to partially update a technology product. Only fields that are explicitly set will be
 * applied.
 *
 * Apps API 1.0 model inferred from {@link PatchTechnologyProductRequestSchemaV1}, so
 * `PatchTechnologyProductRequestV1` and the runtime validator can never describe different shapes.
 */
export type PatchTechnologyProductRequestV1 = z.infer<typeof PatchTechnologyProductRequestSchemaV1>;
