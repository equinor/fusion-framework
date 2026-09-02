import { z } from 'zod';
import { AccessRequirementSchemaV1 } from './access-requirement-schema-v1';

/**
 * Zod schema for the `ForbiddenItem` model published by the Fusion Apps API 1.0.
 *
 * One reason the Apps service refused a request, with its access requirements.
 */
export const ForbiddenItemSchemaV1 = z
  .object({
    /** Requirements evaluated while refusing the request. */
    accessRequirements: z
      .array(AccessRequirementSchemaV1)
      .describe('Requirements evaluated while refusing the request.'),
    /** Machine-readable code naming the refusal. */
    code: z.string().describe('Machine-readable code naming the refusal.'),
    /** Human-readable explanation of the refusal. */
    message: z.string().describe('Human-readable explanation of the refusal.'),
  })
  .describe('One reason the Apps service refused a request, with its access requirements.');

/**
 * One reason the Apps service refused a request, with its access requirements.
 *
 * Apps API 1.0 model inferred from {@link ForbiddenItemSchemaV1}, so `ForbiddenItemV1` and the
 * runtime validator can never describe different shapes.
 */
export type ForbiddenItemV1 = z.infer<typeof ForbiddenItemSchemaV1>;
