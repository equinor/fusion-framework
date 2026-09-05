import { z } from 'zod';
import { UpdateBusinessOwnerRequestSchemaV1 } from './update-business-owner-request-schema-v1';

/**
 * Zod schema for the `PatchPropertyOfListOfUpdateBusinessOwnerRequest` model published by the
 * Fusion Apps API 1.0.
 *
 * Updated list of business owners for the app.
 */
export const PatchPropertyOfListOfUpdateBusinessOwnerRequestSchemaV1 = z
  .array(UpdateBusinessOwnerRequestSchemaV1)
  .nullable()
  .describe('Updated list of business owners for the app.');

/**
 * Updated list of business owners for the app.
 *
 * Apps API 1.0 model inferred from {@link PatchPropertyOfListOfUpdateBusinessOwnerRequestSchemaV1},
 * so `PatchPropertyOfListOfUpdateBusinessOwnerRequestV1` and the runtime validator can never
 * describe different shapes.
 */
export type PatchPropertyOfListOfUpdateBusinessOwnerRequestV1 = z.infer<
  typeof PatchPropertyOfListOfUpdateBusinessOwnerRequestSchemaV1
>;
