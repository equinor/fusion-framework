import { z } from 'zod';

/**
 * Zod schema for the `ApiEndpointConfig` model published by the Fusion Apps API 1.0.
 *
 * Configuration for a named service endpoint available to a Fusion application or widget build.
 */
export const ApiEndpointConfigSchemaV1 = z
  .object({
    /** The OAuth2 scopes required to call this service endpoint. */
    scopes: z
      .array(z.string())
      .describe('The OAuth2 scopes required to call this service endpoint.'),
    /** The base URL of the service endpoint. */
    url: z.string().describe('The base URL of the service endpoint.'),
  })
  .describe(
    'Configuration for a named service endpoint available to a Fusion application or widget build.',
  );

/**
 * Configuration for a named service endpoint available to a Fusion application or widget build.
 *
 * Apps API 1.0 model inferred from {@link ApiEndpointConfigSchemaV1}, so `ApiEndpointConfigV1` and
 * the runtime validator can never describe different shapes.
 */
export type ApiEndpointConfigV1 = z.infer<typeof ApiEndpointConfigSchemaV1>;
