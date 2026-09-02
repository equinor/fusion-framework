import { z } from 'zod';
import { PatchPropertyOfBooleanSchemaV1 } from './patch-property-of-boolean-schema-v1';
import { PatchPropertyOfStringSchemaV1 } from './patch-property-of-string-schema-v1';

/**
 * Zod schema for the `PatchContextTypeRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to partially update a context type. Only fields that are explicitly set will be applied.
 */
export const PatchContextTypeRequestSchemaV1 = z
  .object({
    /** Description of the context type. */
    description: PatchPropertyOfStringSchemaV1.optional().describe(
      'Description of the context type.',
    ),
    /** Whether the context type is defined outside Fusion core. */
    isCustom: PatchPropertyOfBooleanSchemaV1.optional().describe(
      'Whether the context type is defined outside Fusion core.',
    ),
  })
  .describe(
    'Request to partially update a context type. Only fields that are explicitly set will be applied.',
  );

/**
 * Request to partially update a context type. Only fields that are explicitly set will be applied.
 *
 * Apps API 1.0 model inferred from {@link PatchContextTypeRequestSchemaV1}, so
 * `PatchContextTypeRequestV1` and the runtime validator can never describe different shapes.
 */
export type PatchContextTypeRequestV1 = z.infer<typeof PatchContextTypeRequestSchemaV1>;
