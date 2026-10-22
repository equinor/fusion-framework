import type { ITelemetryProvider } from '@equinor/fusion-framework-module-telemetry';
import { createOperationalTelemetry } from './create-operational-telemetry.js';

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
 * @param telemetry - Optional telemetry provider; when absent, the provider is left untouched.
 * @template T - Auth provider type.
 * @throws Never directly; wrapped methods rethrow the original authentication error.
 */
export function connectAuthTelemetry<T extends Partial<Record<InstrumentedMethod, unknown>>>(
  provider: T,
  telemetry: ITelemetryProvider | undefined,
): void {
  // Telemetry is optional; without it the provider keeps its original methods.
  if (!telemetry) {
    return;
  }
  const report = createOperationalTelemetry('azure-identity', () => telemetry);
  const target = provider as Record<InstrumentedMethod, unknown>;
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
      const started = performance.now();
      try {
        const result = await original.apply(this, args);
        report({ operation, outcome: 'success', duration: performance.now() - started });
        return result;
      } catch (error) {
        report({ operation, outcome: 'failure', duration: performance.now() - started });
        throw error;
      }
    };
  }
}

export default connectAuthTelemetry;
