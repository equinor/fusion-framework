import { filter, take, type Observable } from 'rxjs';
import { OperationalTelemetry } from './OperationalTelemetry.js';
import type { RequestOutcomes } from './measure-request.js';

/** Telemetry hooks of one mutation measured from the provider call. */
export interface MutationTracker {
  /** Ends the mutation with a preparation error, such as a listener veto, before dispatch. */
  fail(error: unknown): void;
  /** Marks the request as sent; from then on, only the store outcome ends it. */
  dispatched(): void;
  /** Cancels the mutation when the caller abandons it before it is sent. */
  abandon(): void;
}

const idle: MutationTracker = { fail: () => {}, dispatched: () => {}, abandon: () => {} };

/**
 * Measures a mutation from the provider call, because it starts immediately whether or not the
 * caller subscribes. The first scoped success or failure action ends it; a preparation error
 * ends it before dispatch, and abandoning it before dispatch records `cancelled` with reason
 * `abandoned`. The observer is released on every path and when the store completes.
 *
 * @template TAction - The store action type.
 * @param telemetry - Scope that records the mutation.
 * @param operation - Static operation label, e.g. `create`.
 * @param action$ - Store actions scoped to this request's reference.
 * @param outcomes - Success and failure matchers of the mutation's async action.
 * @returns Hooks for the preparation error, dispatch and abandonment paths.
 */
export function trackMutation<TAction>(
  telemetry: OperationalTelemetry,
  operation: string,
  action$: Observable<TAction>,
  outcomes: RequestOutcomes<TAction>,
): MutationTracker {
  const end = telemetry.reserve(operation);
  // Without a reserved timer (telemetry absent, closed or at capacity), add no observer.
  if (!end) {
    return idle;
  }
  let sent = false;
  // Only the first terminal action scoped to this request ends it.
  const subscription = action$
    .pipe(
      filter((action) => outcomes.success.match(action) || outcomes.failure.match(action)),
      take(1),
    )
    .subscribe((action) => end(outcomes.success.match(action) ? 'success' : 'failure'));
  return {
    fail: (error) => {
      subscription.unsubscribe();
      const { outcome, reason } = OperationalTelemetry.classifyError(error);
      end(outcome, reason ? { reason } : undefined);
    },
    dispatched: () => {
      sent = true;
    },
    abandon: () => {
      // Once sent, the store outcome still ends it, whether or not anyone is subscribed.
      if (!sent) {
        subscription.unsubscribe();
        end('cancelled', { reason: 'abandoned' });
      }
    },
  };
}
