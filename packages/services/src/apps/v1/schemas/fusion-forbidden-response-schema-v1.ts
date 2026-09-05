import { z } from 'zod';
import { ForbiddenItemSchemaV1 } from './forbidden-item-schema-v1';

/**
 * Zod schema for the `FusionForbiddenResponse` model published by the Fusion Apps API 1.0.
 *
 * The error payload the Apps service returns with `403 Forbidden`.
 */
export const FusionForbiddenResponseSchemaV1 = z
  .object({
    /** The refusal the Apps service returned. */
    error: ForbiddenItemSchemaV1.describe('The refusal the Apps service returned.'),
  })
  .describe('The error payload the Apps service returns with `403 Forbidden`.');

/**
 * The error payload the Apps service returns with `403 Forbidden`.
 *
 * Apps API 1.0 model inferred from {@link FusionForbiddenResponseSchemaV1}, so
 * `FusionForbiddenResponseV1` and the runtime validator can never describe different shapes.
 */
export type FusionForbiddenResponseV1 = z.infer<typeof FusionForbiddenResponseSchemaV1>;
