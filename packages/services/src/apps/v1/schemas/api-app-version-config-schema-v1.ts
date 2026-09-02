import { z } from 'zod';
import { ApiEndpointConfigSchemaV1 } from './api-endpoint-config-schema-v1';

/**
 * Zod schema for the `ApiAppVersionConfig` model published by the Fusion Apps API 1.0.
 *
 * Runtime configuration for a specific Fusion application build version, including environment
 * variables and service endpoint definitions.
 */
export const ApiAppVersionConfigSchemaV1 = z
  .object({
    /** Named service endpoints available to this application build, keyed by endpoint name. */
    endpoints: z
      .record(z.string(), ApiEndpointConfigSchemaV1)
      .optional()
      .describe(
        'Named service endpoints available to this application build, keyed by endpoint name.',
      ),
    /** Arbitrary JSON object containing environment-specific variables for the application build. */
    environment: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'Arbitrary JSON object containing environment-specific variables for the application build.',
      ),
  })
  .describe(
    'Runtime configuration for a specific Fusion application build version, including environment variables and service endpoint definitions.',
  );

/**
 * Runtime configuration for a specific Fusion application build version, including environment
 * variables and service endpoint definitions.
 *
 * Apps API 1.0 model inferred from {@link ApiAppVersionConfigSchemaV1}, so `ApiAppVersionConfigV1`
 * and the runtime validator can never describe different shapes.
 */
export type ApiAppVersionConfigV1 = z.infer<typeof ApiAppVersionConfigSchemaV1>;
