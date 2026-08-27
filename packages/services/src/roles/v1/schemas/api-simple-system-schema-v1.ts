import { z } from 'zod';

/** Zod schema for the minimal system reference nested in role and access-role responses. */
export const ApiSimpleSystemSchemaV1 = z
  .object({
    /** Unique identifier of the system. */
    id: z.string().optional().describe('Unique identifier of the system.'),
    /** Name of the system. */
    name: z.string().optional().describe('Name of the system.'),
  })
  .describe('The minimal system reference nested in role and access-role responses.');

/**
 * A registered system in condensed form, as embedded in roles and access roles.
 *
 * Roles API 1.0 model inferred from {@link ApiSimpleSystemSchemaV1}, so `ApiSimpleSystemV1` and
 * the runtime validator can never describe different shapes.
 */
export type ApiSimpleSystemV1 = z.infer<typeof ApiSimpleSystemSchemaV1>;
