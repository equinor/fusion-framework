import { z } from 'zod';

/**
 * Zod schema for the `AppGovernanceDocumentRequest` model published by the Fusion Apps API 1.0.
 *
 * Represents a governance document attached to an app.
 */
export const AppGovernanceDocumentRequestSchemaV1 = z
  .object({
    /** The markdown or plain-text content of the governance document. */
    content: z
      .string()
      .nullish()
      .describe('The markdown or plain-text content of the governance document.'),
    /** The document type. Allowed values: AccessOverview, Goal, DataSource, PrivacyStatement, LRA. */
    type: z
      .string()
      .optional()
      .describe(
        'The document type. Allowed values: AccessOverview, Goal, DataSource, PrivacyStatement, LRA.',
      ),
  })
  .describe('Represents a governance document attached to an app.');

/**
 * Represents a governance document attached to an app.
 *
 * Apps API 1.0 model inferred from {@link AppGovernanceDocumentRequestSchemaV1}, so
 * `AppGovernanceDocumentRequestV1` and the runtime validator can never describe different shapes.
 */
export type AppGovernanceDocumentRequestV1 = z.infer<typeof AppGovernanceDocumentRequestSchemaV1>;
