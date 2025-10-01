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
    .record(z.unknown())
    .optional()
    .describe('Optional additional properties for the telemetry item.'),
  metadata: z.record(z.unknown()).optional().describe('Optional metadata for the telemetry item.'),
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
export const TelemetryEventSchema = TelemetryItemSchema.extend({
  type: z.literal(TelemetryType.Event),
});

/**
 * Zod schema for a telemetry exception item.
 *
 * Extends TelemetryItemSchema and sets type to 'exception'.
 * Adds an exception property of type Error.
 */
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
export const TelemetryMetricSchema = TelemetryItemSchema.extend({
  type: z.literal(TelemetryType.Metric),
  value: z.number().describe('The value of the metric.'),
});

/**
 * Zod schema for a custom telemetry event.
 *
 * Extends TelemetryEventSchema and allows passthrough of additional properties.
 */
export const TelemetryCustomEventSchema = TelemetryEventSchema.extend({
  type: z.literal(TelemetryType.Custom),
}).passthrough();

/**
 * Parses a telemetry item according to the `TelemetryItemSchema`.
 *
 * @param item - The input object to be parsed, expected to conform to the input type of `TelemetryItemSchema`.
 * @returns The parsed telemetry item, conforming to the inferred type of `TelemetryItemSchema
 */
export function parseTelemetryItem(
  item: z.input<typeof TelemetryEventSchema>,
): z.infer<typeof TelemetryEventSchema>;

/**
 * Parses a telemetry item according to the `TelemetryExceptionSchema`.
 *
 * @param item - The input object to be parsed, expected to conform to the input type of `TelemetryExceptionSchema`.
 * @returns The parsed telemetry item, conforming to the inferred type of `TelemetryExceptionSchema`.
 */
export function parseTelemetryItem(
  item: z.input<typeof TelemetryExceptionSchema>,
): z.infer<typeof TelemetryExceptionSchema>;

/**
 * Parses a telemetry item according to the `TelemetryMetricSchema`.
 *
 * @param item - The input object to be parsed, expected to conform to the input type of `TelemetryMetricSchema`.
 * @returns The parsed telemetry item, conforming to the inferred type of `TelemetryMetricSchema`.
 */
export function parseTelemetryItem(
  item: z.input<typeof TelemetryMetricSchema>,
): z.infer<typeof TelemetryMetricSchema>;

/**
 * Parses a telemetry item using the `TelemetryCustomEventSchema`.
 *
 * @param item - The input object to be parsed, expected to conform to the input type of `TelemetryCustomEventSchema`.
 * @returns The parsed telemetry item, conforming to the inferred type of `TelemetryCustomEventSchema`.
 */
export function parseTelemetryItem(
  item: z.input<typeof TelemetryCustomEventSchema>,
): z.infer<typeof TelemetryCustomEventSchema>;

/**
 * Parses a telemetry item and returns the strongly-typed telemetry object based on its type.
 *
 * Overloads:
 * - If the input is a TelemetryEvent, returns a TelemetryEvent.
 * - If the input is a TelemetryException, returns a TelemetryException.
 * - If the input is a TelemetryMetric, returns a TelemetryMetric.
 * - If the input is a TelemetryCustomEvent, returns a TelemetryCustomEvent.
 *
 * @param item - The telemetry item to parse. The type property determines which schema is used for parsing.
 * @returns The parsed and validated telemetry object of the appropriate type.
 * @throws {Error} If the telemetry type is unknown or validation fails.
 */
export function parseTelemetryItem(
  item: z.input<typeof TelemetryItemSchema>,
): z.infer<typeof TelemetryItemSchema> {
  switch (item.type) {
    case TelemetryType.Event:
      return TelemetryEventSchema.parse(item);
    case TelemetryType.Exception:
      return TelemetryExceptionSchema.parse(item);
    case TelemetryType.Metric:
      return TelemetryMetricSchema.parse(item);
    case TelemetryType.Custom:
      return TelemetryCustomEventSchema.parse(item);
    default:
      throw new Error(
        `Unknown telemetry type: ${typeof (item as { type: unknown }).type === 'string' ? (item as { type: string }).type : 'unknown'}`,
      );
  }
}
