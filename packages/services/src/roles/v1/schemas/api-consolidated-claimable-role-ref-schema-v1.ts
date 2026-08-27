import { z } from 'zod';

/** Zod schema for the claimable role reference in a consolidated assignment. */
export const ApiConsolidatedClaimableRoleRefSchemaV1 = z
  .object({
    /** Unique identifier of the claimable role. */
    id: z.string().optional().describe('Unique identifier of the claimable role.'),
    /** Name of the claimable role. */
    name: z.string().optional().describe('Name of the claimable role.'),
    /** Human-readable display name of the claimable role. */
    displayName: z
      .string()
      .optional()
      .describe('Human-readable display name of the claimable role.'),
    /** Description of the claimable role. */
    description: z.string().optional().describe('Description of the claimable role.'),
  })
  .describe('The claimable role reference in a consolidated assignment.');

/**
 * The claimable role a consolidated claimable role assignment view refers to.
 *
 * Roles API 1.0 model inferred from {@link ApiConsolidatedClaimableRoleRefSchemaV1}, so
 * `ApiConsolidatedClaimableRoleRefV1` and the runtime validator can never describe different
 * shapes.
 */
export type ApiConsolidatedClaimableRoleRefV1 = z.infer<
  typeof ApiConsolidatedClaimableRoleRefSchemaV1
>;
