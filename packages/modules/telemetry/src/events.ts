import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import type { TelemetryItem } from './types.js';

export class TelemetryEvent extends FrameworkEvent<
  FrameworkEventInit<{ item: TelemetryItem }, ITelemetryProvider>
> {
  constructor(item: TelemetryItem, source: ITelemetryProvider) {
    super('onTelemetry', { detail: { item }, source });
  }
}

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
