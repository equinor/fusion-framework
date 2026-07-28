import z from 'zod';

/**
 * Zod schema for a single service object returned by the service
 * discovery API.
 *
 * Validates required fields (`key`, `uri`) and optional metadata, then
 * transforms the result to include a backward-compatible `defaultScopes`
 * accessor.
 */
const ApiService = z
  .object({
    key: z.string().describe('The key used to identify the service'),
    uri: z.string().describe('The URI of the service'),
    id: z.string().optional().describe('The ID of the service'),
    environment: z.string().optional().describe('The environment of the service'),
    name: z.string().optional().describe('The name of the service'),
    scopes: z.array(z.string()).optional().default([]).describe('Endpoint authentication scopes'),
    tags: z.array(z.string()).optional().describe('Tags for the service'),
  })
  .describe('A service from the service discovery API')
  .transform((value) => ({
    ...value,
    /** @deprecated use `scopes`  */
    get defaultScopes() {
      return value.scopes ?? [];
    },
  }));

/**
 * Zod schema for the service list returned by the service discovery API.
 *
 * Parses and validates an array of service objects, each conforming to the
 * `ApiService` schema above. Used internally by
 * {@link ServiceDiscoveryClient} to validate API responses.
 */
export const ApiServices = z
  .array(ApiService)
  .describe('A list of services from the service discovery API');
