/**
 * Test doubles for the telemetry module.
 *
 * @remarks
 * Imported from `@equinor/fusion-framework-module-telemetry/mock`, so the mock
 * ships and versions with the implementation it stands in for.
 *
 * The mock replaces only the adapter telemetry items reach — everything
 * around it (metadata merging, default scoping, parent-provider relaying) is
 * the real `TelemetryProvider`, so a test still exercises how the application
 * tracks telemetry, not just canned data.
 *
 * @example
 * ```typescript
 * import { enableTelemetryMock } from '@equinor/fusion-framework-module-telemetry/mock';
 *
 * enableTelemetryMock(configurator);
 * ```
 *
 * @packageDocumentation
 */
export {
  MockTelemetryAdapter,
  type TelemetryItemMatcher,
  type WaitForItemOptions,
} from './MockTelemetryAdapter.js';
export { TelemetryMockConfigurator } from './TelemetryMockConfigurator.js';
export { enableTelemetryMock, telemetryMockModule, type TelemetryConfigMockFn } from './module.js';
