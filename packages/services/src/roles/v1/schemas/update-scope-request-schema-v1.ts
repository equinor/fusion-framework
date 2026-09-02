import { z } from 'zod';

/** Zod schema for the body of an update-scope-type request. */
export const UpdateScopeRequestSchemaV1 = z
  .object({
    /** New description. Pass `null` to clear the existing description. */
    description: z
      .string()
      .nullish()
      .describe('New description. Pass `null` to clear the existing description.'),
  })
  .describe('The body of an update-scope-type request.');

/**
 * Patch request body for updating a scope type.
 *
 * Roles API 1.0 model inferred from {@link UpdateScopeRequestSchemaV1}, so
 * `UpdateScopeRequestV1` and the runtime validator can never describe different shapes.
 */
export type UpdateScopeRequestV1 = z.infer<typeof UpdateScopeRequestSchemaV1>;
