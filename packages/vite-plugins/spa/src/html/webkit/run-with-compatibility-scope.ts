import type { IMeasurement } from '@equinor/fusion-framework-module-telemetry';

/**
 * Runs an operation and records its measurement on every exit path without `Symbol.dispose`.
 *
 * @param measurement - Measurement whose scope is ending.
 * @param run - Operation executed while the measurement is active.
 * @returns A promise that resolves when the operation finishes.
 */
export async function runWithCompatibilityScope(
  measurement: IMeasurement,
  run: () => Promise<void>,
): Promise<void> {
  try {
    await run();
  } finally {
    try {
      measurement.measure();
    } catch {
      // Telemetry cleanup must not mask operation failures or break teardown.
    }
  }
}
