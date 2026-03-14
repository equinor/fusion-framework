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

export { default } from './module.js';
