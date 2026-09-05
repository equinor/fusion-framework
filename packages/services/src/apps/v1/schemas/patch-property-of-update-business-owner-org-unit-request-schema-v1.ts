import type { z } from 'zod';
import { UpdateBusinessOwnerOrgUnitRequestSchemaV1 } from './update-business-owner-org-unit-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfUpdateBusinessOwnerOrgUnitRequest` model published by the
 * Fusion Apps API 1.0.
 *
 * Updated org unit responsible for business ownership of the app.
 */
export const PatchPropertyOfUpdateBusinessOwnerOrgUnitRequestSchemaV1 =
  UpdateBusinessOwnerOrgUnitRequestSchemaV1.nullable().describe(
    'Updated org unit responsible for business ownership of the app.',
  );

/**
 * Updated org unit responsible for business ownership of the app.
 *
 * Apps API 1.0 model inferred from
 * {@link PatchPropertyOfUpdateBusinessOwnerOrgUnitRequestSchemaV1}, so
 * `PatchPropertyOfUpdateBusinessOwnerOrgUnitRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type PatchPropertyOfUpdateBusinessOwnerOrgUnitRequestV1 = z.infer<
  typeof PatchPropertyOfUpdateBusinessOwnerOrgUnitRequestSchemaV1
>;
