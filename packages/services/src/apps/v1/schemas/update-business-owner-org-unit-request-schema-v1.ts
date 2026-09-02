import { z } from 'zod';

/**
 * Zod schema for the `UpdateBusinessOwnerOrgUnitRequest` model published by the Fusion Apps API
 * 1.0.
 *
 * Identifies the org unit responsible for business ownership of an app by its SAP ID.
 */
export const UpdateBusinessOwnerOrgUnitRequestSchemaV1 = z
  .object({
    /** The SAP ID of the org unit. Set to null to remove the org unit assignment. */
    sapId: z
      .string()
      .nullish()
      .describe('The SAP ID of the org unit. Set to null to remove the org unit assignment.'),
  })
  .describe('Identifies the org unit responsible for business ownership of an app by its SAP ID.');

/**
 * Identifies the org unit responsible for business ownership of an app by its SAP ID.
 *
 * Apps API 1.0 model inferred from {@link UpdateBusinessOwnerOrgUnitRequestSchemaV1}, so
 * `UpdateBusinessOwnerOrgUnitRequestV1` and the runtime validator can never describe different
 * shapes.
 */
export type UpdateBusinessOwnerOrgUnitRequestV1 = z.infer<
  typeof UpdateBusinessOwnerOrgUnitRequestSchemaV1
>;
