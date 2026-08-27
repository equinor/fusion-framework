import { z } from 'zod';

/** Zod schema for a system owner supplied when registering or updating a system. */
export const OwnerInfoSchemaV1 = z
  .object({
    /** Account ID or mail of the owner. */
    accountIdentifier: z.string().optional().describe('Account ID or mail of the owner.'),
    /** Reason this account owns the system. */
    reason: z.string().optional().describe('Reason this account owns the system.'),
  })
  .describe('A system owner supplied when registering or updating a system.');

/**
 * Identifies a system owner and the reason for their ownership.
 *
 * Roles API 1.0 model inferred from {@link OwnerInfoSchemaV1}, so `OwnerInfoV1` and the runtime
 * validator can never describe different shapes.
 */
export type OwnerInfoV1 = z.infer<typeof OwnerInfoSchemaV1>;
