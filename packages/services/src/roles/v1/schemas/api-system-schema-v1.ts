import { z } from 'zod';
import { ApiOwnerSchemaV1 } from './api-owner-schema-v1';
import { ApiSimpleSystemSchemaV1 } from './api-simple-system-schema-v1';

/** Zod schema for a system returned by the Fusion Roles V2 API. */
export const ApiSystemSchemaV1 = ApiSimpleSystemSchemaV1.and(
  z.object({
    /** Description of the system. */
    description: z.string().optional().describe('Description of the system.'),
    /** Owners of the system. */
    owners: z.array(ApiOwnerSchemaV1).optional().describe('Owners of the system.'),
  }),
).describe('A system returned by the Fusion Roles V2 API.');

/**
 * Represents a system with its owners.
 *
 * Roles API 1.0 model inferred from {@link ApiSystemSchemaV1}, so `ApiSystemV1` and the runtime
 * validator can never describe different shapes.
 */
export type ApiSystemV1 = z.infer<typeof ApiSystemSchemaV1>;
