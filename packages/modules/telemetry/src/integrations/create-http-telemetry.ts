import { telemetryExportRequest } from '@equinor/fusion-framework-module';
import type { ITelemetryProvider } from '../TelemetryProvider.interface.js';
import type { OperationalOutcome } from '../schemas/diagnostic-context.js';
import { createOperationalReporter } from '../utils/create-operational-reporter.js';

/** Middleware-compatible integration without a runtime dependency on the HTTP module. */
export interface HttpTelemetry {
  /**
   * Measures a transport attempt through fetch resolution/rejection, not body completion.
   * Register innermost, after retry middleware, so each retry attempt has its own outcome.
   */
  middleware: (
    uri: string,
    init: RequestInit,
    next: (uri: string, init: RequestInit) => Promise<Response>,
  ) => Promise<Response>;
  /** Detaches diagnostic effects without aborting business requests. */
  dispose: () => void;
}

/**
 * Creates optional HTTP instrumentation without waiting for telemetry during initialization.
 * No URL, headers, bodies, or raw errors enter the generated records.
 * @param provider - Lazy telemetry lookup; undefined leaves HTTP behavior unchanged.
 * @returns Middleware and its lifecycle-owned teardown.
 * @throws Rethrows the original business request failure from the middleware, unchanged.
 * @example
 * ```ts
 * const diagnostics = createHttpTelemetry(() => telemetry);
 * httpConfigurator.addMiddleware(diagnostics.middleware);
 * // Return diagnostics.dispose from the owning host plugin.
 * ```
 */
export function createHttpTelemetry(provider: () => ITelemetryProvider | undefined): HttpTelemetry {
  const report = createOperationalReporter(provider);
  let active = true;
  return {
    middleware: async (uri, init, next) => {
      // Exporter-owned requests must not recursively instrument their own telemetry delivery.
      if (!active || telemetryExportRequest in init) {
        return next(uri, init);
      }
      const started = performance.now();
      let outcome: OperationalOutcome = 'success';
      try {
        const response = await next(uri, init);
        outcome = response.ok ? 'success' : 'failure';
        return response;
      } catch (error) {
        outcome = init.signal?.aborted ? 'cancelled' : 'failure';
        throw error;
      } finally {
        // Detached instrumentation must not emit after the owning host is torn down.
        if (active) {
          report({
            module: 'http',
            operation: 'request',
            outcome,
            duration: performance.now() - started,
          });
        }
      }
    },
    dispose: () => {
      active = false;
    },
  };
}
