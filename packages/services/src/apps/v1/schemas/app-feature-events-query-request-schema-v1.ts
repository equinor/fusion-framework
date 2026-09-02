import { z } from 'zod';

/**
 * Zod schema for the `AppFeatureEventsQueryRequest` model published by the Fusion Apps API 1.0.
 *
 * The body of a request querying the app feature-events dataset.
 */
export const AppFeatureEventsQueryRequestSchemaV1 = z
  .object({
    /** Optional GraphQL operation name for named queries. */
    operationName: z
      .string()
      .optional()
      .describe('Optional GraphQL operation name for named queries.'),
    /** GraphQL query string (required). */
    query: z.string().describe('GraphQL query string (required).'),
    /** Optional GraphQL variables object. */
    variables: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Optional GraphQL variables object.'),
  })
  .describe('The body of a request querying the app feature-events dataset.');

/**
 * The body of a request querying the app feature-events dataset.
 *
 * Apps API 1.0 model inferred from {@link AppFeatureEventsQueryRequestSchemaV1}, so
 * `AppFeatureEventsQueryRequestV1` and the runtime validator can never describe different shapes.
 */
export type AppFeatureEventsQueryRequestV1 = z.infer<typeof AppFeatureEventsQueryRequestSchemaV1>;
