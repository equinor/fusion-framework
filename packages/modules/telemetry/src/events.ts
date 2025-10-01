import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import type { TelemetryItem } from './types.js';

/**
 * Represents a telemetry event within the framework.
 *
 * This event encapsulates a `TelemetryItem` and is associated with a specific `ITelemetryProvider` source.
 * It extends the `FrameworkEvent` class, providing a standardized way to emit and handle telemetry-related events.
 *
 * @example
 * ```typescript
 * const event = new TelemetryEvent(item, provider);
 * ```
 *
 * @param item - The telemetry item containing event data.
 * @param source - The telemetry provider that is the source of this event.
 */
export class TelemetryEvent extends FrameworkEvent<
  FrameworkEventInit<{ item: TelemetryItem }, ITelemetryProvider>
> {
  constructor(item: TelemetryItem, source: ITelemetryProvider) {
    super('onTelemetry', { detail: { item }, source });
  }
}

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
 *
 * @param error - The error instance that was thrown.
 * @param source - The telemetry provider where the error originated.
 */
export class TelemetryErrorEvent extends FrameworkEvent<
  FrameworkEventInit<{ error: Error }, ITelemetryProvider>
> {
  constructor(error: Error, source: ITelemetryProvider) {
    super('onTelemetryError', { detail: { error }, source });
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    onTelemetry: TelemetryEvent;
    onTelemetryError: TelemetryErrorEvent;
  }
}
