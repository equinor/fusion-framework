import { z } from 'zod';

import { TelemetryLevel, TelemetryType } from './static.js';

/**
 * Schema for a telemetry item, defining the structure and validation rules for telemetry data.
 *
 * @property name - The name of the telemetry item.
 * @property level - The severity level of the telemetry item. Defaults to `TelemetryLevel.Information`.
 * @property type - The type of telemetry. Defaults to `TelemetryType.Custom`.
 * @property properties - Optional additional properties for the telemetry item.
 * @property metadata - Optional metadata for the telemetry item.
 */
export const TelemetryItemSchema = z.object({
  name: z.string().describe('The name of the telemetry item.'),
  type: z.nativeEnum(TelemetryType).describe('The type of telemetry. Defaults to Custom.'),
  level: z
    .nativeEnum(TelemetryLevel)
    .optional()
    .default(TelemetryLevel.Information)
    .describe('The severity level of the telemetry item. Defaults to Information.'),
  properties: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Optional additional properties for the telemetry item.'),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Optional metadata for the telemetry item.'),
  scope: z
    .array(z.string())
    .optional()
    .describe('Optional scope for the telemetry item.')
    .transform((scopes) => [...new Set(scopes)]),
});

/**
 * Zod schema for a telemetry event item.
 *
 * Extends TelemetryItemSchema and sets type to 'event'.
 */
// Deliberately co-located with the other telemetry item schemas below
// fusion-lint-disable-next-line single-export-per-file
export const TelemetryEventSchema = TelemetryItemSchema.extend({
  type: z.literal(TelemetryType.Event),
});

/**
 * Zod schema for a telemetry exception item.
 *
 * Extends TelemetryItemSchema and sets type to 'exception'.
 * Adds an exception property of type Error.
 */
// Deliberately co-located with the other telemetry item schemas above/below
// fusion-lint-disable-next-line single-export-per-file
export const TelemetryExceptionSchema = TelemetryItemSchema.extend({
  type: z.literal(TelemetryType.Exception),
  exception: z.instanceof(Error).describe('The exception object.'),
});

/**
 * Zod schema for a telemetry metric item.
 *
 * Extends TelemetryItemSchema and sets type to 'metric'.
 * Adds a value property for the metric value.
 */
// Deliberately co-located with the other telemetry item schemas above/below
// fusion-lint-disable-next-line single-export-per-file
export const TelemetryMetricSchema = TelemetryItemSchema.extend({
  type: z.literal(TelemetryType.Metric),
  value: z.number().describe('The value of the metric.'),
});

/**
 * Zod schema for a custom telemetry event.
 *
 * Extends TelemetryEventSchema and allows passthrough of additional properties.
 */
// Deliberately co-located with the other telemetry item schemas above
// fusion-lint-disable-next-line single-export-per-file
export const TelemetryCustomEventSchema = TelemetryEventSchema.extend({
  type: z.literal(TelemetryType.Custom),
}).passthrough();

// Re-exported from its own file to satisfy single-export-per-file while
// preserving the public `./schemas` subpath export surface.
export { parseTelemetryItem } from './parse-telemetry-item.js';
