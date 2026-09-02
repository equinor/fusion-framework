import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';

/**
 * Zod schema for the `ApiTechnologyProduct` model published by the Fusion Apps API 1.0.
 *
 * The technology product this application is registered under. if not registered.
 */
export const ApiTechnologyProductSchemaV1 = z
  .object({
    /** Account owning the product from the business side. */
    businessSolutionOwner: ApiAccountSchemaV1.optional().describe(
      'Account owning the product from the business side.',
    ),
    /** The UTC date and time when this technology product was created. */
    createdAt: z
      .string()
      .optional()
      .describe('The UTC date and time when this technology product was created.'),
    /** A description of the technology product's purpose and scope. */
    description: z
      .string()
      .optional()
      .describe("A description of the technology product's purpose and scope."),
    /** The internal unique identifier for this technology product. */
    id: z
      .string()
      .optional()
      .describe('The internal unique identifier for this technology product.'),
    /** The name of the technology product. */
    name: z.string().optional().describe('The name of the technology product.'),
    /** Account managing the technology product. */
    technologyProductManager: ApiAccountSchemaV1.optional().describe(
      'Account managing the technology product.',
    ),
    /** The UTC date and time when this technology product was last updated. if never updated. */
    updatedAt: z
      .string()
      .nullish()
      .describe(
        'The UTC date and time when this technology product was last updated. if never updated.',
      ),
  })
  .describe('The technology product this application is registered under. if not registered.');

/**
 * The technology product this application is registered under. if not registered.
 *
 * Apps API 1.0 model inferred from {@link ApiTechnologyProductSchemaV1}, so
 * `ApiTechnologyProductV1` and the runtime validator can never describe different shapes.
 */
export type ApiTechnologyProductV1 = z.infer<typeof ApiTechnologyProductSchemaV1>;
