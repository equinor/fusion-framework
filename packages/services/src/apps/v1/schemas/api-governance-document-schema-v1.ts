import { z } from 'zod';
import { ApiAccountSchemaV1 } from './api-account-schema-v1';

/**
 * Zod schema for the `ApiGovernanceDocument` model published by the Fusion Apps API 1.0.
 *
 * A governance document attached to a Fusion application, such as a privacy impact assessment or
 * risk register.
 */
export const ApiGovernanceDocumentSchemaV1 = z
  .object({
    /** The full text content of the document. */
    content: z.string().optional().describe('The full text content of the document.'),
    /** The UTC date and time when this document was created. */
    createdAt: z
      .string()
      .optional()
      .describe('The UTC date and time when this document was created.'),
    /** Account that created the document. */
    createdBy: ApiAccountSchemaV1.optional().describe('Account that created the document.'),
    /** The unique identifier for this governance document. */
    id: z.string().optional().describe('The unique identifier for this governance document.'),
    /** The machine-readable document type name, e.g. PrivacyImpactAssessment. */
    type: z
      .string()
      .optional()
      .describe('The machine-readable document type name, e.g. PrivacyImpactAssessment.'),
    /** Human-readable display name for the document type. */
    typeDisplayName: z
      .string()
      .optional()
      .describe('Human-readable display name for the document type.'),
    /** The UTC date and time when this document was last updated. if never updated. */
    updatedAt: z
      .string()
      .nullish()
      .describe('The UTC date and time when this document was last updated. if never updated.'),
    /** Account that last updated the document, if any. */
    updatedBy: ApiAccountSchemaV1.nullish().describe(
      'Account that last updated the document, if any.',
    ),
  })
  .describe(
    'A governance document attached to a Fusion application, such as a privacy impact assessment or risk register.',
  );

/**
 * A governance document attached to a Fusion application, such as a privacy impact assessment or
 * risk register.
 *
 * Apps API 1.0 model inferred from {@link ApiGovernanceDocumentSchemaV1}, so
 * `ApiGovernanceDocumentV1` and the runtime validator can never describe different shapes.
 */
export type ApiGovernanceDocumentV1 = z.infer<typeof ApiGovernanceDocumentSchemaV1>;
