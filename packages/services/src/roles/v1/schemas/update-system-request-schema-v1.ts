import { z } from 'zod';
import { OwnerInfoSchemaV1 } from './owner-info-schema-v1';

/** Zod schema for the body of an update-system request. */
export const UpdateSystemRequestSchemaV1 = z
  .object({
    /** New description. Pass `null` to clear the existing description. */
    description: z
      .string()
      .nullish()
      .describe('New description. Pass `null` to clear the existing description.'),
    /** New owner list. Pass `null` to clear the existing owners. */
    owners: z
      .array(OwnerInfoSchemaV1)
      .nullish()
      .describe('New owner list. Pass `null` to clear the existing owners.'),
  })
  .describe('The body of an update-system request.');

/**
 * Patch request body for updating a system.
 *
 * Roles API 1.0 model inferred from {@link UpdateSystemRequestSchemaV1}, so
 * `UpdateSystemRequestV1` and the runtime validator can never describe different shapes.
 */
export type UpdateSystemRequestV1 = z.infer<typeof UpdateSystemRequestSchemaV1>;
