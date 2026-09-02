import { z } from 'zod';

/** Zod schema for the body of a create-scope-type request. */
export const CreateScopeTypeRequestSchemaV1 = z
  .object({
    /** Name of the scope type. Only URL-safe characters are accepted. */
    name: z
      .string()
      .optional()
      .describe('Name of the scope type. Only URL-safe characters are accepted.'),
    /** Description of the scope type. */
    description: z.string().optional().describe('Description of the scope type.'),
  })
  .describe('The body of a create-scope-type request.');

/**
 * Request body for creating a new scope type.
 *
 * Roles API 1.0 model inferred from {@link CreateScopeTypeRequestSchemaV1}, so
 * `CreateScopeTypeRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreateScopeTypeRequestV1 = z.infer<typeof CreateScopeTypeRequestSchemaV1>;
