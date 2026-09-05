import { z } from 'zod';

/**
 * Zod schema for the `AccessRequirement` model published by the Fusion Apps API 1.0.
 *
 * A single access requirement the Apps service evaluated while authorising a request.
 */
export const AccessRequirementSchemaV1 = z
  .object({
    /** Machine-readable code naming the evaluated requirement. */
    code: z.string().describe('Machine-readable code naming the evaluated requirement.'),
    /** Human-readable explanation of the requirement. */
    description: z.string().describe('Human-readable explanation of the requirement.'),
    /** Result of evaluating the requirement. */
    outcome: z.string().nullable().describe('Result of evaluating the requirement.'),
    /** Whether the requirement was evaluated for this request. */
    wasEvaluated: z.boolean().describe('Whether the requirement was evaluated for this request.'),
  })
  .describe('A single access requirement the Apps service evaluated while authorising a request.');

/**
 * A single access requirement the Apps service evaluated while authorising a request.
 *
 * Apps API 1.0 model inferred from {@link AccessRequirementSchemaV1}, so `AccessRequirementV1` and
 * the runtime validator can never describe different shapes.
 */
export type AccessRequirementV1 = z.infer<typeof AccessRequirementSchemaV1>;
