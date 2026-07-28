import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { ITelemetryProvider } from './TelemetryProvider.interface.js';

/**
 * Event representing an error that occurred within a telemetry provider.
 *
 * @remarks
 * This event is emitted when an error is encountered by an {@link ITelemetryProvider}.
 * It encapsulates the error details and the source provider.
 *
 * @example
 * ```typescript
 * const errorEvent = new TelemetryErrorEvent(new Error('Something went wrong'), telemetryProvider);
 * ```
 *
 * @extends FrameworkEvent
 */
export class TelemetryErrorEvent extends FrameworkEvent<
  FrameworkEventInit<{ error: Error }, ITelemetryProvider>
> {
  /**
   * Creates a new `TelemetryErrorEvent`.
   *
   * @param error - The error instance that was thrown.
   * @param source - The telemetry provider where the error originated.
   */
  constructor(error: Error, source: ITelemetryProvider) {
    super('onTelemetryError', { detail: { error }, source });
  }
}
