import { z } from 'zod';

/** Zod schema for the body of an activate-assigned-claimable-role request. */
export const ActivateAssignedClaimableRoleRequestSchemaV1 = z
  .object({
    /** Reason recorded for claiming the role. */
    reason: z.string().optional().describe('Reason recorded for claiming the role.'),
    /** Requested activation duration, in hours. */
    hours: z
      .union([z.number(), z.string()])
      .optional()
      .describe('Requested activation duration, in hours.'),
  })
  .describe('The body of an activate-assigned-claimable-role request.');

/**
 * Request body for activating (claiming) an assigned claimable role.
 *
 * Roles API 1.0 model inferred from {@link ActivateAssignedClaimableRoleRequestSchemaV1}, so
 * `ActivateAssignedClaimableRoleRequestV1` and the runtime validator can never describe
 * different shapes.
 */
export type ActivateAssignedClaimableRoleRequestV1 = z.infer<
  typeof ActivateAssignedClaimableRoleRequestSchemaV1
>;
