import { z } from 'zod';

/**
 * Zod schema for the `EndpointConfigRequest` model published by the Fusion Apps API 1.0.
 *
 * Configures a named API endpoint available to an app or widget at runtime.
 */
export const EndpointConfigRequestSchemaV1 = z
  .object({
    /** OAuth2 scopes required to call the endpoint. Leave null if no scopes are needed. */
    scopes: z
      .array(z.string())
      .nullable()
      .describe('OAuth2 scopes required to call the endpoint. Leave null if no scopes are needed.'),
    /** The base URL of the endpoint. */
    url: z.string().describe('The base URL of the endpoint.'),
  })
  .describe('Configures a named API endpoint available to an app or widget at runtime.');

/**
 * Configures a named API endpoint available to an app or widget at runtime.
 *
 * Apps API 1.0 model inferred from {@link EndpointConfigRequestSchemaV1}, so
 * `EndpointConfigRequestV1` and the runtime validator can never describe different shapes.
 */
export type EndpointConfigRequestV1 = z.infer<typeof EndpointConfigRequestSchemaV1>;
