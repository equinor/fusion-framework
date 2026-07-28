import type { z } from 'zod';

import { TelemetryType } from './static.js';
import {
  TelemetryCustomEventSchema,
  TelemetryEventSchema,
  TelemetryExceptionSchema,
  type TelemetryItemSchema,
  TelemetryMetricSchema,
} from './schemas.js';

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
 *
 * @example
 * ```typescript
 * import { parseTelemetryItem } from '@equinor/fusion-framework-module-telemetry/schemas';
 * import { TelemetryType } from '@equinor/fusion-framework-module-telemetry';
 *
 * const item = parseTelemetryItem({
 *   name: 'page_view',
 *   type: TelemetryType.Event,
 * });
 * ```
 */
export function parseTelemetryItem(
  item: z.input<typeof TelemetryItemSchema>,
): z.infer<typeof TelemetryItemSchema> {
  // Dispatch to the schema matching this item's declared type
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
