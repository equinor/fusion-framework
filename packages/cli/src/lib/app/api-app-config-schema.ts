import { z } from 'zod';

/**
 * Zod schema for validating the API application configuration object.
 *
 * This schema defines the structure and types for the app config used in the Fusion Framework CLI.
 * It ensures that the configuration adheres to expected types and provides sensible defaults.
 */
export const ApiAppConfigSchema = z
  .object({
    environment: z
      .record(z.string(), z.any())
      .describe(
        'Key-value map of environment-specific variables for the application. Defaults to an empty object if not provided.',
      )
      .optional()
      .default({}), // Arbitrary environment variables, default empty
    endpoints: z
      .record(
        z.string(),
        z.object({
          url: z.string({ message: 'The endpoint URL. This field is required.' }),
          scopes: z
            .array(z.string())
            .optional()
            .default([])
            .describe(
              'List of scopes required for accessing this endpoint. Defaults to an empty array.',
            ),
        }),
      )
      .describe(
        'A mapping of endpoint names to their configuration objects. Each endpoint must specify a URL and may specify scopes.',
      )
      .optional(), // Endpoints are optional
  })
  .describe(
    'The API application configuration schema, defining environment variables and endpoints for the application.',
  );

/**
 * Type representing the validated API application configuration.
 *
 * This type is inferred from the Zod schema and should be used throughout the CLI
 * to ensure type safety and consistency with the schema.
 */
export type ApiAppConfig = z.infer<typeof ApiAppConfigSchema>;
