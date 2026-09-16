import { z } from 'zod';

/** Zod schema for the body of an activate-assigned-claimable-role request. */
export const ActivateAssignedClaimableRoleRequestSchemaV1 = z
  .object({
    /** Reason recorded for claiming the role. */
    reason: z
      .string()
      .refine((reason) => reason.trim().length > 0, 'Activation reason is required')
      .max(500, 'Activation reason must be at most 500 characters')
      .describe('Reason recorded for claiming the role, from 1 through 500 characters.'),
    /** Requested activation duration, in hours. */
    hours: z
      .number()
      .int('Activation duration must be an integer')
      .min(1, 'Activation duration must be at least 1 hour')
      .max(24, 'Activation duration must be at most 24 hours')
      .describe('Requested activation duration, as an integer from 1 through 24 hours.'),
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
