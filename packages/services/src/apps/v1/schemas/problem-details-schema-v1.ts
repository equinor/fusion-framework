import { z } from 'zod';

/**
 * Zod schema for the `ProblemDetails` model published by the Fusion Apps API 1.0.
 *
 * An RFC 7807 problem document describing a failed request.
 */
export const ProblemDetailsSchemaV1 = z
  .object({
    /** Human-readable explanation specific to this occurrence. */
    detail: z
      .string()
      .nullish()
      .describe('Human-readable explanation specific to this occurrence.'),
    /** URI reference identifying this occurrence of the problem. */
    instance: z
      .string()
      .nullish()
      .describe('URI reference identifying this occurrence of the problem.'),
    /** HTTP status code the service answered with. */
    status: z
      .union([z.number(), z.string()])
      .nullish()
      .describe('HTTP status code the service answered with.'),
    /** Short human-readable summary of the problem type. */
    title: z.string().nullish().describe('Short human-readable summary of the problem type.'),
    /** URI reference identifying the problem type. */
    type: z.string().nullish().describe('URI reference identifying the problem type.'),
  })
  .describe('An RFC 7807 problem document describing a failed request.');

/**
 * An RFC 7807 problem document describing a failed request.
 *
 * Apps API 1.0 model inferred from {@link ProblemDetailsSchemaV1}, so `ProblemDetailsV1` and the
 * runtime validator can never describe different shapes.
 */
export type ProblemDetailsV1 = z.infer<typeof ProblemDetailsSchemaV1>;
