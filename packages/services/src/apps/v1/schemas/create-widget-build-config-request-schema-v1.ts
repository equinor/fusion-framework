import { z } from 'zod';
import { EndpointConfigRequestSchemaV1 } from './endpoint-config-request-schema-v1';

/**
 * Zod schema for the `CreateWidgetBuildConfigRequest` model published by the Fusion Apps API 1.0.
 *
 * Request to create or replace the build configuration for a widget.
 */
export const CreateWidgetBuildConfigRequestSchemaV1 = z
  .object({
    /** Named endpoint configurations available to the widget, keyed by endpoint name. */
    endpoints: z
      .record(z.string(), EndpointConfigRequestSchemaV1)
      .nullish()
      .describe('Named endpoint configurations available to the widget, keyed by endpoint name.'),
    /** Environment variables exposed to the widget at runtime, keyed by variable name. */
    environment: z
      .record(z.string(), z.unknown())
      .nullish()
      .describe('Environment variables exposed to the widget at runtime, keyed by variable name.'),
  })
  .describe('Request to create or replace the build configuration for a widget.');

/**
 * Request to create or replace the build configuration for a widget.
 *
 * Apps API 1.0 model inferred from {@link CreateWidgetBuildConfigRequestSchemaV1}, so
 * `CreateWidgetBuildConfigRequestV1` and the runtime validator can never describe different shapes.
 */
export type CreateWidgetBuildConfigRequestV1 = z.infer<
  typeof CreateWidgetBuildConfigRequestSchemaV1
>;
