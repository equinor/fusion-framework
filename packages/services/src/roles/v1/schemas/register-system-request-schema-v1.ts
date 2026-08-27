import { z } from 'zod';
import { OwnerInfoSchemaV1 } from './owner-info-schema-v1';

/** Zod schema for the body of a register-system request. */
export const RegisterSystemRequestSchemaV1 = z
  .object({
    /** Name of the system. Only URL-safe characters are accepted. */
    name: z
      .string()
      .optional()
      .describe('Name of the system. Only URL-safe characters are accepted.'),
    /** Description of the system. */
    description: z.string().optional().describe('Description of the system.'),
    /** Initial owners of the system. */
    owners: z.array(OwnerInfoSchemaV1).optional().describe('Initial owners of the system.'),
  })
  .describe('The body of a register-system request.');

/**
 * Request body for registering a new system.
 *
 * Roles API 1.0 model inferred from {@link RegisterSystemRequestSchemaV1}, so
 * `RegisterSystemRequestV1` and the runtime validator can never describe different shapes.
 */
export type RegisterSystemRequestV1 = z.infer<typeof RegisterSystemRequestSchemaV1>;
