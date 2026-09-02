import { z } from 'zod';
import { ApiScopeTypeSchemaV1 } from './api-scope-type-schema-v1';

/** Zod schema for an access role returned for a specific system. */
export const ApiAccessRoleSchemaV1 = z
  .object({
    /** Unique identifier of the access role. */
    id: z.string().optional().describe('Unique identifier of the access role.'),
    /** Name of the access role. */
    name: z.string().optional().describe('Name of the access role.'),
    /** Description of the access role. */
    description: z.string().optional().describe('Description of the access role.'),
    /** The scope type this access role is scoped by, if it is scoped. */
    scopeType: ApiScopeTypeSchemaV1.nullish().describe(
      'The scope type this access role is scoped by, if it is scoped.',
    ),
  })
  .describe('An access role returned for a specific system.');

/**
 * Represents an access role.
 *
 * Roles API 1.0 model inferred from {@link ApiAccessRoleSchemaV1}, so `ApiAccessRoleV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiAccessRoleV1 = z.infer<typeof ApiAccessRoleSchemaV1>;
