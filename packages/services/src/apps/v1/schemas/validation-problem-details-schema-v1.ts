import { z } from 'zod';

/**
 * Zod schema for the `ValidationProblemDetails` model published by the Fusion Apps API 1.0.
 *
 * An RFC 7807 problem document listing the validation errors of a rejected request.
 */
export const ValidationProblemDetailsSchemaV1 = z
  .object({
    /** Human-readable explanation specific to this occurrence. */
    detail: z
      .string()
      .nullish()
      .describe('Human-readable explanation specific to this occurrence.'),
    /** Validation errors, keyed by the field that failed. */
    errors: z
      .record(z.string(), z.array(z.string()))
      .optional()
      .describe('Validation errors, keyed by the field that failed.'),
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
  .describe('An RFC 7807 problem document listing the validation errors of a rejected request.');

/**
 * An RFC 7807 problem document listing the validation errors of a rejected request.
 *
 * Apps API 1.0 model inferred from {@link ValidationProblemDetailsSchemaV1}, so
 * `ValidationProblemDetailsV1` and the runtime validator can never describe different shapes.
 */
export type ValidationProblemDetailsV1 = z.infer<typeof ValidationProblemDetailsSchemaV1>;
