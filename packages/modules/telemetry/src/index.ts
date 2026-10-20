/**
 * @module @equinor/fusion-framework-module-telemetry
 *
 * Unified telemetry module for the Fusion Framework.
 *
 * Provides a consistent API for tracking events, exceptions, metrics, and custom
 * telemetry data across applications. Supports pluggable adapters (e.g. Application
 * Insights, console) and hierarchical provider composition with metadata merging.
 *
 * @see {@link enableTelemetry} for quick setup via module configurator.
 * @see {@link ITelemetryProvider} for the provider interface used to track telemetry.
 */
export {
  TelemetryModule,
  module as telemetryModule,
} from './module.js';

export type {
  ITelemetryConfigurator,
  TelemetryConfig,
} from './TelemetryConfigurator.interface.js';

export type { ITelemetryProvider } from './TelemetryProvider.interface.js';
export { TelemetryConfigurator } from './TelemetryConfigurator.js';
export { StartupCapture } from './lib/StartupCapture.js';
export type { StartupCaptureOptions } from './lib/StartupCapture.js';

export { Measurement } from './Measurement.js';
export type { IMeasurement } from './Measurement.interface.js';

export { TelemetryLevel, TelemetryType, TelemetryScope } from './static.js';

export type {
  MetadataExtractor,
  MetadataExtractorArgs,
  TelemetryItem,
  TelemetryEvent,
  TelemetryException,
  TelemetryMetric,
  TelemetryCustomEvent,
} from './types.js';

export { enableTelemetry } from './enable-telemetry.js';
export { createOperationalRecords } from './utils/create-operational-records.js';
export type { OperationalRecordArgs } from './utils/create-operational-records.js';
export { createDiagnosticContext } from './utils/create-diagnostic-context.js';
export type { DiagnosticContextArgs } from './utils/create-diagnostic-context.js';
export type {
  DiagnosticContext,
  OperationalOutcome,
  TelemetrySource,
} from './schemas/diagnostic-context.js';
export { createHttpTelemetry } from './integrations/create-http-telemetry.js';
export type { HttpTelemetry } from './integrations/create-http-telemetry.js';
export { observeQueryTelemetry } from './integrations/observe-query-telemetry.js';
export type { QueryDiagnosticEvent } from './integrations/observe-query-telemetry.js';

export { default } from './module.js';
