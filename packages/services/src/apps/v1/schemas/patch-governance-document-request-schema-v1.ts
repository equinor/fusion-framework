import { z } from 'zod';
import { PatchPropertyOfStringSchemaV1 } from './patch-property-of-string-schema-v1';

/**
 * Zod schema for the `PatchGovernanceDocumentRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to partially update a governance document. Only fields that are explicitly set will be
 * applied.
 */
export const PatchGovernanceDocumentRequestSchemaV1 = z
  .object({
    /** Markdown content of the governance document. */
    content: PatchPropertyOfStringSchemaV1.optional().describe(
      'Markdown content of the governance document.',
    ),
  })
  .describe(
    'Request to partially update a governance document. Only fields that are explicitly set will be applied.',
  );

/**
 * Request to partially update a governance document. Only fields that are explicitly set will be
 * applied.
 *
 * Apps API 1.0 model inferred from {@link PatchGovernanceDocumentRequestSchemaV1}, so
 * `PatchGovernanceDocumentRequestV1` and the runtime validator can never describe different shapes.
 */
export type PatchGovernanceDocumentRequestV1 = z.infer<
  typeof PatchGovernanceDocumentRequestSchemaV1
>;
