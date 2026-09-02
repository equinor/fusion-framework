import { z } from 'zod';
import { ApiEndpointConfigSchemaV1 } from './api-endpoint-config-schema-v1';

/**
 * Zod schema for the `ApiWidgetVersionConfig` model published by the Fusion Apps API 1.0.
 *
 * Runtime configuration for a specific Fusion widget build version, including environment variables
 * and service endpoint definitions.
 */
export const ApiWidgetVersionConfigSchemaV1 = z
  .object({
    /** Named service endpoints available to this widget build, keyed by endpoint name. */
    endpoints: z
      .record(z.string(), ApiEndpointConfigSchemaV1)
      .optional()
      .describe('Named service endpoints available to this widget build, keyed by endpoint name.'),
    /** Arbitrary JSON object containing environment-specific variables for the widget build. */
    environment: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'Arbitrary JSON object containing environment-specific variables for the widget build.',
      ),
  })
  .describe(
    'Runtime configuration for a specific Fusion widget build version, including environment variables and service endpoint definitions.',
  );

/**
 * Runtime configuration for a specific Fusion widget build version, including environment variables
 * and service endpoint definitions.
 *
 * Apps API 1.0 model inferred from {@link ApiWidgetVersionConfigSchemaV1}, so
 * `ApiWidgetVersionConfigV1` and the runtime validator can never describe different shapes.
 */
export type ApiWidgetVersionConfigV1 = z.infer<typeof ApiWidgetVersionConfigSchemaV1>;
