import type { IMeasurement } from '@equinor/fusion-framework-module-telemetry';

// Match downlevel `using` helpers without requiring or mutating the browser's Symbol.dispose.
const disposeSymbol: typeof Symbol.dispose = Symbol.dispose ?? Symbol.for('Symbol.dispose');

/**
 * Completes a fallback bootstrap measurement through its existing disposal protocol.
 *
 * Use from `finally` instead of `using` so embedded WebKit can parse bootstrap.
 * The protocol keeps custom IMeasurement implementations compatible without
 * requiring the concrete Measurement class's explicit `dispose()` method.
 *
 * @param measurement - Measurement whose scope is ending.
 */
export function disposeMeasurement(measurement: IMeasurement): void {
  measurement[disposeSymbol]();
}
