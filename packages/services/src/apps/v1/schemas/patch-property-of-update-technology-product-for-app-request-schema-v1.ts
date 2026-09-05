import type { z } from 'zod';
import { UpdateTechnologyProductForAppRequestSchemaV1 } from './update-technology-product-for-app-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfUpdateTechnologyProductForAppRequest` model published by the
 * Fusion Apps API 1.0.
 *
 * Updated reference to the technology product associated with the app.
 */
export const PatchPropertyOfUpdateTechnologyProductForAppRequestSchemaV1 =
  UpdateTechnologyProductForAppRequestSchemaV1.nullable().describe(
    'Updated reference to the technology product associated with the app.',
  );

/**
 * Updated reference to the technology product associated with the app.
 *
 * Apps API 1.0 model inferred from
 * {@link PatchPropertyOfUpdateTechnologyProductForAppRequestSchemaV1}, so
 * `PatchPropertyOfUpdateTechnologyProductForAppRequestV1` and the runtime validator can never
 * describe different shapes.
 */
export type PatchPropertyOfUpdateTechnologyProductForAppRequestV1 = z.infer<
  typeof PatchPropertyOfUpdateTechnologyProductForAppRequestSchemaV1
>;
