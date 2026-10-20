/**
 * Public `@equinor/fusion-framework-module-telemetry/schemas` entry point.
 *
 * Zod schemas for validating telemetry items, and `parseTelemetryItem` for parsing unknown
 * input into a typed item.
 */
export {
  TelemetryItemSchema,
  TelemetryEventSchema,
  TelemetryExceptionSchema,
  TelemetryMetricSchema,
  TelemetryCustomEventSchema,
} from './telemetry-item-schema.js';
export { parseTelemetryItem } from '../parse-telemetry-item.js';
