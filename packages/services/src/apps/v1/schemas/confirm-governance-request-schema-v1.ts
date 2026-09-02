import { z } from 'zod';

/**
 * Zod schema for the `ConfirmGovernanceRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to confirm a governance review, optionally including a comment.
 */
export const ConfirmGovernanceRequestSchemaV1 = z
  .object({
    /** An optional comment to record alongside the governance confirmation. */
    comment: z
      .string()
      .nullish()
      .describe('An optional comment to record alongside the governance confirmation.'),
  })
  .describe('Request to confirm a governance review, optionally including a comment.');

/**
 * Request to confirm a governance review, optionally including a comment.
 *
 * Apps API 1.0 model inferred from {@link ConfirmGovernanceRequestSchemaV1}, so
 * `ConfirmGovernanceRequestV1` and the runtime validator can never describe different shapes.
 */
export type ConfirmGovernanceRequestV1 = z.infer<typeof ConfirmGovernanceRequestSchemaV1>;
