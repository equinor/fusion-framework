import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import type { TelemetryItem } from './types.js';
import type { TelemetryErrorEvent } from './TelemetryErrorEvent.js';

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
  /**
   * Creates a new `TelemetryEvent`.
   *
   * @param item - The telemetry item containing event data.
   * @param source - The telemetry provider that is the source of this event.
   */
  constructor(item: TelemetryItem, source: ITelemetryProvider) {
    super('onTelemetry', { detail: { item }, source });
  }
}

// Re-exported from its own file to satisfy single-export-per-file while
// preserving this file's existing public export surface.
export { TelemetryErrorEvent } from './TelemetryErrorEvent.js';

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    onTelemetry: TelemetryEvent;
    onTelemetryError: TelemetryErrorEvent;
  }
}
