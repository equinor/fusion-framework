import { z } from 'zod';
import { AccountIdentifierSchemaV1 } from './account-identifier-schema-v1';

/**
 * Zod schema for the `CreateTechnologyProductRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to create a new technology product.
 */
export const CreateTechnologyProductRequestSchemaV1 = z
  .object({
    /** Account owning the product from the business side. */
    businessSolutionOwner: AccountIdentifierSchemaV1.optional().describe(
      'Account owning the product from the business side.',
    ),
    /** A description of the technology product. */
    description: z.string().optional().describe('A description of the technology product.'),
    /** The name of the technology product. */
    name: z.string().optional().describe('The name of the technology product.'),
    /** Account managing the technology product. */
    technicalProductManager: AccountIdentifierSchemaV1.optional().describe(
      'Account managing the technology product.',
    ),
  })
  .describe('Request to create a new technology product.');

/**
 * Request to create a new technology product.
 *
 * Apps API 1.0 model inferred from {@link CreateTechnologyProductRequestSchemaV1}, so
 * `CreateTechnologyProductRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreateTechnologyProductRequestV1 = z.infer<
  typeof CreateTechnologyProductRequestSchemaV1
>;
