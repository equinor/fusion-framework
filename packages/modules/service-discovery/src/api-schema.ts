import z from 'zod';

/**
 * Represents a service from the service discovery API.
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
 * Represents a list of services from the service discovery API.
 *
 * This constant is an array of `ApiService` objects, which are defined
 * elsewhere in the codebase. It uses the `z.array` method from the Zod
 * library to enforce that the array contains only `ApiService` objects.
 *
 * @constant
 * @description A list of services from the service discovery API.
 */
export const ApiServices = z
  .array(ApiService)
  .describe('A list of services from the service discovery API');
