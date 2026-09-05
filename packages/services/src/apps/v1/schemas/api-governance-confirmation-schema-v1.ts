import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';

/**
 * Zod schema for the `ApiGovernanceConfirmation` model published by the Fusion Apps API 1.0.
 *
 * The most recent governance review confirmation. if the app has never been confirmed.
 */
export const ApiGovernanceConfirmationSchemaV1 = z
  .object({
    /** An optional comment provided by the confirming party explaining the confirmation. */
    comment: z
      .string()
      .nullish()
      .describe(
        'An optional comment provided by the confirming party explaining the confirmation.',
      ),
    /** The UTC date and time when the governance information was confirmed. */
    confirmedAt: z
      .string()
      .optional()
      .describe('The UTC date and time when the governance information was confirmed.'),
    /** Account that confirmed the governance information. */
    confirmedBy: ApiAccountSchemaV1.optional().describe(
      'Account that confirmed the governance information.',
    ),
  })
  .describe('The most recent governance review confirmation. if the app has never been confirmed.');

/**
 * The most recent governance review confirmation. if the app has never been confirmed.
 *
 * Apps API 1.0 model inferred from {@link ApiGovernanceConfirmationSchemaV1}, so
 * `ApiGovernanceConfirmationV1` and the runtime validator can never describe different shapes.
 */
export type ApiGovernanceConfirmationV1 = z.infer<typeof ApiGovernanceConfirmationSchemaV1>;
