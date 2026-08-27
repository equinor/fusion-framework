import { z } from 'zod';

/** Zod schema for the result of purging expired role binding records. */
export const ApiPurgeBindingResultSchemaV1 = z
  .object({
    /** The number of records deleted during the purge operation. */
    deletedCount: z
      .union([z.number(), z.string()])
      .optional()
      .describe('The number of records deleted during the purge operation.'),
  })
  .describe('The result of purging expired role binding records.');

/**
 * Response model for purge operations indicating the number of records deleted.
 *
 * Roles API 1.0 model inferred from {@link ApiPurgeBindingResultSchemaV1}, so
 * `ApiPurgeBindingResultV1` and the runtime validator can never describe different shapes.
 */
export type ApiPurgeBindingResultV1 = z.infer<typeof ApiPurgeBindingResultSchemaV1>;
