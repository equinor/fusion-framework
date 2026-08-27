import { z } from 'zod';
import { ApiSimpleSystemSchemaV1 } from './api-simple-system-schema-v1';

/** Zod schema for the minimal role reference nested in assignment responses. */
export const ApiSimpleRoleSchemaV1 = z
  .object({
    /** Unique identifier of the role. */
    id: z.string().optional().describe('Unique identifier of the role.'),
    /** Name of the role. */
    name: z.string().optional().describe('Name of the role.'),
    /** Human-readable display name of the role. */
    displayName: z.string().optional().describe('Human-readable display name of the role.'),
    /** Description of the role. */
    description: z.string().optional().describe('Description of the role.'),
    /** The system that owns this record, if any. */
    system: ApiSimpleSystemSchemaV1.nullish().describe('The system that owns this record, if any.'),
  })
  .describe('The minimal role reference nested in assignment responses.');

/**
 * A role in condensed form: identity, name, display name, description, and owning system.
 *
 * Roles API 1.0 model inferred from {@link ApiSimpleRoleSchemaV1}, so `ApiSimpleRoleV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiSimpleRoleV1 = z.infer<typeof ApiSimpleRoleSchemaV1>;
