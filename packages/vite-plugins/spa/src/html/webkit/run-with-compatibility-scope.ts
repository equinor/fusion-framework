import type { IMeasurement } from '@equinor/fusion-framework-module-telemetry';

import { disposeMeasurement } from './dispose-measurement.js';

/**
 * Runs an operation and disposes its measurement on every exit path.
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
    disposeMeasurement(measurement);
  }
}
