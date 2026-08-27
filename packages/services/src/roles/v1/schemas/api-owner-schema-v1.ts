import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';

/** Zod schema for an owner entry attached to a system. */
export const ApiOwnerSchemaV1 = z
  .object({
    /** Reason this account is registered as an owner. */
    reason: z.string().optional().describe('Reason this account is registered as an owner.'),
    /** The account holding the ownership. */
    account: ApiAccountSchemaV1.optional().describe('The account holding the ownership.'),
  })
  .describe('An owner entry attached to a system.');

/**
 * Represents a system owner with the reason for ownership.
 *
 * Roles API 1.0 model inferred from {@link ApiOwnerSchemaV1}, so `ApiOwnerV1` and the runtime
 * validator can never describe different shapes.
 */
export type ApiOwnerV1 = z.infer<typeof ApiOwnerSchemaV1>;
