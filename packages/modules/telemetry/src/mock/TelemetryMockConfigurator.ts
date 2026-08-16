import { TelemetryConfigurator } from '../TelemetryConfigurator.js';

import { MockTelemetryAdapter } from './MockTelemetryAdapter.js';

/**
 * The real telemetry configurator, with a {@link MockTelemetryAdapter}
 * registered by default so tracked telemetry never reaches a real backend
 * unless a test adds its own adapter alongside it.
 *
 * @remarks
 * Nothing else changes: `setMetadata`, `setDefaultScope`, `setParent`,
 * `setFilter` and additional `setAdapter`/`configureAdapter` calls all behave
 * exactly as they do on {@link TelemetryConfigurator}. Only the default
 * adapter differs, so a test observes the real telemetry pipeline —
 * metadata merging, scoping, parent-provider relaying — rather than a
 * rehearsal of it.
 *
 * @example
 * ```typescript
 * const configurator = new TelemetryMockConfigurator();
 * const fusion = await init(configurator);
 *
 * // ...exercise the app under test, then assert:
 * const item = await configurator.adapter.waitForItem('my-metric');
 * ```
 */
export class TelemetryMockConfigurator extends TelemetryConfigurator {
  /** The adapter every telemetry item processed through this configurator is recorded to. */
  public readonly adapter: MockTelemetryAdapter;

  /**
   * Creates a telemetry configurator backed by a {@link MockTelemetryAdapter}.
   *
   * @param adapter - The adapter to register by default. Defaults to a new,
   *   empty {@link MockTelemetryAdapter}.
   */
  constructor(adapter: MockTelemetryAdapter = new MockTelemetryAdapter()) {
    super();
    this.adapter = adapter;
    this.setAdapter('mock', adapter);
  }
}

export default TelemetryMockConfigurator;
