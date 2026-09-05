import { z } from 'zod';

/**
 * Zod schema for the `ApiDocumentType` model published by the Fusion Apps API 1.0.
 *
 * Defines a governance document type, such as a privacy impact assessment or security review.
 */
export const ApiDocumentTypeSchemaV1 = z
  .object({
    /** Human-readable display name for the document type. */
    displayName: z
      .string()
      .optional()
      .describe('Human-readable display name for the document type.'),
    /** The machine-readable name for this document type, e.g. PrivacyImpactAssessment. */
    name: z
      .string()
      .optional()
      .describe('The machine-readable name for this document type, e.g. PrivacyImpactAssessment.'),
  })
  .describe(
    'Defines a governance document type, such as a privacy impact assessment or security review.',
  );

/**
 * Defines a governance document type, such as a privacy impact assessment or security review.
 *
 * Apps API 1.0 model inferred from {@link ApiDocumentTypeSchemaV1}, so `ApiDocumentTypeV1` and the
 * runtime validator can never describe different shapes.
 */
export type ApiDocumentTypeV1 = z.infer<typeof ApiDocumentTypeSchemaV1>;
