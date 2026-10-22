import { telemetryExportRequest } from '@equinor/fusion-framework-module';
import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import { createOperationalTelemetry } from '@equinor/fusion-framework-module-telemetry/utils';

/** Static operation label recorded for each instrumented provider method. */
const operations = {
  // acquireAccessToken delegates to acquireToken, so measuring acquireToken counts each once.
  acquireToken: 'acquire-token',
  login: 'login',
  logout: 'logout',
} as const;

/** Provider methods measured at the public boundary. */
type InstrumentedMethod = keyof typeof operations;

/**
 * Measures authentication outcomes on an initialized Node auth provider.
 *
 * Wraps `acquireToken`, `login` and `logout` on the instance so default-credential and
 * interactive-browser providers are measured at the same public boundary;
 * `acquireAccessToken` is counted once through `acquireToken`. Results and
 * errors pass through unchanged; tokens, scopes, accounts, auth records and original errors
 * are never recorded.
 *
 * @param provider - Initialized auth provider owned by the module.
 * Calls whose options carry the telemetry export marker, such as token acquisition for an
 * exporter's HTTP request, are not recorded; concurrent application calls still are.
 * Reporting stops when the provider's `dispose()` runs, or when the returned function is
 * called, so in-flight calls never report into a torn-down telemetry host.
 *
 * @param telemetry - Optional telemetry provider; when absent, the provider is left untouched.
 * @returns A function that stops reporting without restoring the original methods.
 * @template T - Auth provider type.
 * @throws Never directly; wrapped methods rethrow the original authentication error.
 */
export function connectAuthTelemetry<T extends Partial<Record<InstrumentedMethod, unknown>>>(
  provider: T,
  telemetry: ITelemetryProvider | undefined,
): () => void {
  const operational = createOperationalTelemetry('azure-identity');
  const disconnect = (): void => operational.disconnect();
  // Telemetry is optional; without it the provider keeps its original methods.
  if (!telemetry) {
    return disconnect;
  }
  operational.connect(telemetry);
  const target = provider as Record<InstrumentedMethod | 'dispose', unknown>;
  const dispose = target.dispose;
  // Provider teardown is the lifecycle owner, so disposal also stops reporting.
  if (typeof dispose === 'function') {
    target.dispose = function (this: unknown, ...args: unknown[]) {
      disconnect();
      return dispose.apply(this, args);
    };
  }
  // Each public boundary is wrapped once, on the instance, so prototypes stay untouched.
  for (const method of Object.keys(operations) as InstrumentedMethod[]) {
    const original = target[method];
    // Custom providers may implement only part of the contract.
    if (typeof original !== 'function') {
      // Nothing to measure for a missing method; keep instrumenting the rest.
      continue;
    }
    const operation = operations[method];
    target[method] = async function (this: unknown, ...args: unknown[]) {
      const [options] = args;
      // Authentication for telemetry delivery belongs to the export and is never recorded,
      // otherwise each export would produce a record to export in turn.
      if (typeof options === 'object' && options !== null && telemetryExportRequest in options) {
        return original.apply(this, args);
      }
      const started = performance.now();
      try {
        const result = await original.apply(this, args);
        operational.report({
          operation,
          outcome: 'success',
          duration: performance.now() - started,
        });
        return result;
      } catch (error) {
        operational.report({
          operation,
          outcome: 'failure',
          duration: performance.now() - started,
        });
        throw error;
      }
    };
  }
  return disconnect;
}

export default connectAuthTelemetry;
