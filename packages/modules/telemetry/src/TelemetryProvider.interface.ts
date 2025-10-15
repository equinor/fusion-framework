import type { z } from 'zod';

import type { TelemetryItem } from './types.js';
import type { TelemetryExceptionSchema, TelemetryMetricSchema } from './schemas.js';
import type { TelemetryType, TelemetryLevel, TelemetryScope } from './static.js';
import type { Observable } from 'rxjs';
import type { IMeasurement } from './Measurement.interface.js';
import type { ITelemetryAdapter } from './TelemetryAdapter.js';

/**
 * Interface for telemetry providers used to track and measure telemetry events.
 *
 * Telemetry items typically include:
 * - `name`: The event or metric name
 * - `type`: The telemetry type, see {@link TelemetryType}
 * - `level`: The severity, see {@link TelemetryLevel}
 * - `scope`: The context, see {@link TelemetryScope}
 * - `properties`: Additional data
 *
 * The `type` property should reference the {@link TelemetryType} enum:
 * - `TelemetryType.Event` - for general events
 * - `TelemetryType.Exception` - for error/exception tracking
 * - `TelemetryType.Metric` - for metric/measurement data
 * - `TelemetryType.Custom` - for custom telemetry types
 *
 * The `level` property (if supported by the item) should reference the {@link TelemetryLevel} enum to indicate severity:
 * - `TelemetryLevel.Debug` - Debugging information useful during development
 * - `TelemetryLevel.Information` - General information about the system's operation
 * - `TelemetryLevel.Warning` - Indicates a potential issue that is not critical
 * - `TelemetryLevel.Error` - Represents an error that has occurred, but the system can continue running
 * - `TelemetryLevel.Critical` - A severe error that may cause the system to stop functioning
 *
 * The `scope` property (if supported by the item) should reference the `TelemetryScope` enum to indicate the context of the telemetry:
 * - `TelemetryScope.Application` - Telemetry specific to the application layer (recommended for consumers)
 * - `TelemetryScope.Framework` - Reserved for internal use only (framework development)
 */
export interface ITelemetryProvider {
  items: Observable<TelemetryItem>;
  /**
   * Track a telemetry event.
   *
   * @param item - The telemetry item to be tracked. This typically includes event name, type, level, scope, and any associated data.
   *
   * @example
   * // Track an event
   * provider.track({
   *   type: TelemetryType.Event,
   *   name: 'user_login',
   *   properties: { userId: '123' },
   *   level: TelemetryLevel.Information,
   *   scope: TelemetryScope.Application
   * });
   *
   * // Track an exception
   * provider.track({
   *   type: TelemetryType.Exception,
   *   name: 'api_error',
   *   properties: { message: 'Request failed', code: 500 },
   *   level: TelemetryLevel.Error,
   *   scope: TelemetryScope.Application
   * });
   *
   * // Track a metric
   * provider.track({
   *   type: TelemetryType.Metric,
   *   name: 'load_time',
   *   properties: { duration: 1234 },
   *   level: TelemetryLevel.Information,
   *   scope: TelemetryScope.Application
   * });
   *
   * // Track a custom telemetry item
   * provider.track({
   *   type: TelemetryType.Custom,
   *   name: 'custom_event',
   *   properties: { foo: 'bar' },
   *   level: TelemetryLevel.Verbose,
   *   scope: TelemetryScope.Application
   * });
   */
  track<T extends TelemetryItem>(item: T): void;

  /**
   * Track a telemetry event with a specific type.
   *
   * @param item - The telemetry item to be tracked, excluding the 'type' property. The type will default to `TelemetryType.Event`.
   *
   * @example
   * provider.trackEvent({
   *   name: 'user_signup',
   *   properties: { userId: '456' },
   * });
   */
  trackEvent(item: Omit<TelemetryItem, 'type'> & { type?: TelemetryType.Event }): void;

  /**
   * Track a telemetry exception.
   *
   * @param data - The telemetry exception data to be tracked, excluding the 'type' property.
   *
   * @example
   * provider.trackException({
   *   name: 'api_error',
   *   properties: { message: 'Request failed', code: 500 },
   * });
   */
  trackException(data: Omit<z.input<typeof TelemetryExceptionSchema>, 'type'>): void;

  /**
   * Track a telemetry metric.
   *
   * @param data - The telemetry metric data to be tracked, excluding the 'type' property.
   * @example
   * provider.trackMetric({
   *   name: 'load_time',
   *   value: 1234,
   *   properties: { page: 'home' },
   * });
   */
  trackMetric(data: Omit<z.input<typeof TelemetryMetricSchema>, 'type'>): void;

  /**
   * Start a measurement for a telemetry event. Returns a function to complete the measurement.
   *
   * @param data - The initial data for the measurement, excluding the 'type' property. Typically includes event name and properties.
   * @returns A function that can be called (optionally with updated data) to complete and record the measurement.
   *
   * @example
   * const end = provider.measure({ name: 'load_time', properties: { page: 'home' } });
   * // ... perform operation ...
   * end(); // Completes and records the measurement
   *
   * // Optionally, provide updated data when ending the measurement:
   * end({ properties: { page: 'home', status: 'success' } });
   */
  measure(data: Omit<z.input<typeof TelemetryMetricSchema>, 'type' | 'value'>): IMeasurement;

  /**
   * Get a telemetry adapter by its identifier.
   * @param identifier - The unique identifier of the telemetry adapter to retrieve.
   * @returns The telemetry adapter instance if found, or undefined if not found.
   */
  getAdapter(identifier: string): ITelemetryAdapter | undefined;
}
