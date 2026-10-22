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
 * Parses a telemetry item according to the `TelemetryEventSchema`.
 *
 * @param item - The input object to be parsed, expected to conform to the input type of `TelemetryEventSchema`.
 * @returns The parsed telemetry item, conforming to the inferred type of `TelemetryEventSchema`.
 * @throws {Error} If validation against `TelemetryEventSchema` fails.
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
  item: z.input<typeof TelemetryEventSchema>,
): z.infer<typeof TelemetryEventSchema>;

/**
 * Parses a telemetry item according to the `TelemetryExceptionSchema`.
 *
 * @param item - The input object to be parsed, expected to conform to the input type of `TelemetryExceptionSchema`.
 * @returns The parsed telemetry item, conforming to the inferred type of `TelemetryExceptionSchema`.
 * @throws {Error} If validation against `TelemetryExceptionSchema` fails.
 *
 * @example
 * ```typescript
 * import { parseTelemetryItem } from '@equinor/fusion-framework-module-telemetry/schemas';
 * import { TelemetryType } from '@equinor/fusion-framework-module-telemetry';
 *
 * const item = parseTelemetryItem({
 *   name: 'unhandled_rejection',
 *   type: TelemetryType.Exception,
 *   exception: new Error('Something went wrong'),
 * });
 * ```
 */
export function parseTelemetryItem(
  item: z.input<typeof TelemetryExceptionSchema>,
): z.infer<typeof TelemetryExceptionSchema>;

/**
 * Parses a telemetry item according to the `TelemetryMetricSchema`.
 *
 * @param item - The input object to be parsed, expected to conform to the input type of `TelemetryMetricSchema`.
 * @returns The parsed telemetry item, conforming to the inferred type of `TelemetryMetricSchema`.
 * @throws {Error} If validation against `TelemetryMetricSchema` fails.
 *
 * @example
 * ```typescript
 * import { parseTelemetryItem } from '@equinor/fusion-framework-module-telemetry/schemas';
 * import { TelemetryType } from '@equinor/fusion-framework-module-telemetry';
 *
 * const item = parseTelemetryItem({
 *   name: 'time_to_interactive',
 *   type: TelemetryType.Metric,
 *   value: 1234,
 * });
 * ```
 */
export function parseTelemetryItem(
  item: z.input<typeof TelemetryMetricSchema>,
): z.infer<typeof TelemetryMetricSchema>;

/**
 * Parses a telemetry item using the `TelemetryCustomEventSchema`.
 *
 * @param item - The input object to be parsed, expected to conform to the input type of `TelemetryCustomEventSchema`.
 * @returns The parsed telemetry item, conforming to the inferred type of `TelemetryCustomEventSchema`.
 * @throws {Error} If validation against `TelemetryCustomEventSchema` fails.
 *
 * @example
 * ```typescript
 * import { parseTelemetryItem } from '@equinor/fusion-framework-module-telemetry/schemas';
 * import { TelemetryType } from '@equinor/fusion-framework-module-telemetry';
 *
 * const item = parseTelemetryItem({
 *   name: 'feature_toggled',
 *   type: TelemetryType.Custom,
 *   isEnabled: true,
 * });
 * ```
 */
export function parseTelemetryItem(
  item: z.input<typeof TelemetryCustomEventSchema>,
): z.infer<typeof TelemetryCustomEventSchema>;

/**
 * Implementation signature for the `parseTelemetryItem` overloads above.
 *
 * Not part of the public declaration output (TypeScript only emits the
 * overload signatures to `.d.ts`); it dispatches to the schema matching the
 * item's `type` property and throws if the type is unrecognized or
 * validation fails. See the overloads above for consumer-facing docs and
 * examples per telemetry type.
 *
 * @param item - The telemetry item to parse. The `type` property determines which schema is used.
 * @returns The parsed and validated telemetry object of the appropriate type.
 * @throws {Error} If the telemetry type is unknown or validation fails.
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
