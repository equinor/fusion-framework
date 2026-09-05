import { z } from 'zod';
import { EndpointConfigRequestSchemaV1 } from './endpoint-config-request-schema-v1';

/**
 * Zod schema for the `CreateAppBuildConfigRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to create or replace the build configuration for an app.
 */
export const CreateAppBuildConfigRequestSchemaV1 = z
  .object({
    /** Named endpoint configurations available to the app, keyed by endpoint name. */
    endpoints: z
      .record(z.string(), EndpointConfigRequestSchemaV1)
      .nullish()
      .describe('Named endpoint configurations available to the app, keyed by endpoint name.'),
    /** Environment variables exposed to the app at runtime, keyed by variable name. */
    environment: z
      .record(z.string(), z.unknown())
      .nullish()
      .describe('Environment variables exposed to the app at runtime, keyed by variable name.'),
  })
  .describe('Request to create or replace the build configuration for an app.');

/**
 * Request to create or replace the build configuration for an app.
 *
 * Apps API 1.0 model inferred from {@link CreateAppBuildConfigRequestSchemaV1}, so
 * `CreateAppBuildConfigRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreateAppBuildConfigRequestV1 = z.infer<typeof CreateAppBuildConfigRequestSchemaV1>;
