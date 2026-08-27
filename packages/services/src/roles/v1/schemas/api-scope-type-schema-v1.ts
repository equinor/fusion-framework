import { z } from 'zod';

/** Zod schema for a scope-type reference embedded in access-role responses. */
export const ApiScopeTypeSchemaV1 = z
  .object({
    /** Unique identifier of the scope type. */
    id: z.string().optional().describe('Unique identifier of the scope type.'),
    /** Name of the scope type. */
    name: z.string().optional().describe('Name of the scope type.'),
    /** Description of the scope type, if any. */
    description: z.string().nullish().describe('Description of the scope type, if any.'),
  })
  .describe('A scope-type reference embedded in access-role responses.');

/**
 * Represents a scope type that categorises assignments (e.g. project, contract, system).
 *
 * Roles API 1.0 model inferred from {@link ApiScopeTypeSchemaV1}, so `ApiScopeTypeV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiScopeTypeV1 = z.infer<typeof ApiScopeTypeSchemaV1>;
