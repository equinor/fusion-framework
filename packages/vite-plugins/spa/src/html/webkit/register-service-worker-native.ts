import type { ModulesInstance } from '@equinor/fusion-framework-module';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { IMeasurement, TelemetryModule } from '@equinor/fusion-framework-module-telemetry';

import { registerServiceWorker } from '../register-service-worker.js';

/**
 * Registers the SPA service worker with native explicit resource management.
 *
 * @param framework - An initialized Framework instance with MSAL and telemetry modules.
 * @returns A promise that resolves when service-worker registration finishes.
 */
export function registerServiceWorkerNative(
  framework: ModulesInstance<[MsalModule, TelemetryModule]>,
): Promise<void> {
  return registerServiceWorker(framework, async (measurement: IMeasurement, run) => {
    using _measurementScope = measurement;
    await run();
  });
}
