import { z } from 'zod';
import { TechnologyProductIdentifierSchemaV1 } from './technology-product-identifier-schema-v1';

/**
 * Zod schema for the `UpdateTechnologyProductForAppRequest` model published by the Fusion Apps API
 * 1.0.
 *
 * Identifies the technology product to associate with an app.
 */
export const UpdateTechnologyProductForAppRequestSchemaV1 = z
  .object({
    /** Identifier of the technology product. */
    identifier: TechnologyProductIdentifierSchemaV1.nullish().describe(
      'Identifier of the technology product.',
    ),
  })
  .describe('Identifies the technology product to associate with an app.');

/**
 * Identifies the technology product to associate with an app.
 *
 * Apps API 1.0 model inferred from {@link UpdateTechnologyProductForAppRequestSchemaV1}, so
 * `UpdateTechnologyProductForAppRequestV1` and the runtime validator can never describe different
 * shapes.
 */
export type UpdateTechnologyProductForAppRequestV1 = z.infer<
  typeof UpdateTechnologyProductForAppRequestSchemaV1
>;
