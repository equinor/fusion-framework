import type { Observable, Subscription } from 'rxjs';
import type { ITelemetryProvider } from '../TelemetryProvider.interface.js';
import type { OperationalOutcome } from '../schemas/diagnostic-context.js';
import { createOperationalReporter } from '../utils/create-operational-reporter.js';

/**
 * Query transactions tracked at once. Bounds memory for clients that never emit a terminal
 * event; beyond it, new jobs are not timed and a single warning is logged.
 */
const PENDING_TRANSACTION_CAPACITY = 256;

/** Terminal query-client events and the outcome each one records. */
const outcomes = new Map<string, OperationalOutcome>([
  ['query_client_job_completed', 'success'],
  ['query_client_job_failed', 'failure'],
  ['query_client_job_error', 'failure'],
  ['query_client_job_canceled', 'cancelled'],
]);

/** Minimal event projection; query payloads and raw cache keys are not exportable inputs. */
export interface QueryDiagnosticEvent {
  type: string;
  transaction?: string;
}

/**
 * Observes query-client scheduling/execution outcomes using opaque transaction keys internally only.
 * Query and cache payloads are never exported. The owner must unsubscribe during teardown.
 * @param events - Existing query event stream, not a new subscription to query execution.
 * @param provider - Optional lazy telemetry lookup; absence creates no subscription.
 * @returns Owned event subscription, or undefined when telemetry is absent.
 * @example
 * ```ts
 * const subscription = observeQueryTelemetry(query.event$, () => telemetry);
 * // Return subscription from the owning lifecycle teardown.
 * ```
 */
export function observeQueryTelemetry(
  events: Observable<QueryDiagnosticEvent>,
  provider: () => ITelemetryProvider | undefined,
): Subscription | undefined {
  try {
    // An absent provider must not introduce an event subscription or dependency cycle.
    if (!provider()) {
      return undefined;
    }
  } catch {
    console.warn('Query telemetry provider resolution failed');
    return undefined;
  }
  const report = createOperationalReporter(provider);
  const pending = new Map<string, { requested: number; started?: number }>();
  let reportedOverflow = false;
  const subscription = events.subscribe({
    next: (event) => {
      // Existing cache events have no measured lookup boundary; report notifications, not fake durations.
      if (event.type === 'query_cache_hit' || event.type === 'query_cache_miss') {
        report({
          module: 'query',
          operation: event.type === 'query_cache_hit' ? 'cache-hit' : 'cache-miss',
          outcome: 'success',
          notification: true,
        });
        return;
      }
      // Cache and aggregate events have no client transaction and must not create pending jobs.
      if (!event.transaction) {
        return;
      }
      // Start scheduling at the existing client boundary without initiating another query.
      if (event.type === 'query_client_job_requested') {
        // Replayed requests must not reset timing or duplicate terminal records.
        if (pending.has(event.transaction)) {
          return;
        }
        // Opaque transaction IDs are retained only within the bounded observer lifetime.
        if (pending.size < PENDING_TRANSACTION_CAPACITY) {
          pending.set(event.transaction, { requested: performance.now() });
        } else if (!reportedOverflow) {
          reportedOverflow = true;
          console.warn('Query telemetry pending-operation capacity exceeded');
        }
        return;
      }
      const timing = pending.get(event.transaction);
      // Ignore unmatched or already-terminal jobs rather than inventing a start timestamp.
      if (!timing) {
        return;
      }
      // Queue wait and execution measure different infrastructure boundaries.
      if (event.type === 'query_client_job_executing' && timing.started === undefined) {
        timing.started = performance.now();
        report({
          module: 'query',
          operation: 'schedule',
          outcome: 'success',
          duration: timing.started - timing.requested,
        });
        return;
      }
      const terminal = outcomes.get(event.type);
      // Removing a completed transaction deduplicates clients that emit multiple failure events.
      if (terminal) {
        pending.delete(event.transaction);
        report({
          module: 'query',
          operation: timing.started === undefined ? 'schedule' : 'execute',
          outcome: terminal,
          duration: performance.now() - (timing.started ?? timing.requested),
        });
      }
    },
    error: () => console.warn('Query telemetry event stream failed'),
  });
  subscription.add(() => pending.clear());
  return subscription;
}
