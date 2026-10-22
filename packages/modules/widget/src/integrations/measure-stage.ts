import { defer, finalize, identity, tap, type MonoTypeOperatorFunction } from 'rxjs';
import type { OperationalProperties, OperationalTelemetry } from './OperationalTelemetry.js';

/** Static error classifications that are safe to export as a reason code. */
const reasons: Record<string, string> = {
  not_found: 'not-found',
  unauthorized: 'unauthorized',
  deleted: 'deleted',
  unknown: 'unknown',
};

/** Minimal store action shape; only `type` matching and a classified error `type` are read. */
interface StageAction {
  type: string;
  payload?: unknown;
}

/** Terminal action matchers of one async action, e.g. `actions.fetchManifest`. */
export interface StageOutcomes<TAction extends StageAction> {
  success: { match: (action: TAction) => boolean };
  failure: { match: (action: TAction) => boolean };
}

/**
 * Measures one request handled by a store flow: subscribing to the flow's per-request inner
 * observable starts the attempt, and its first success or failure action ends it.
 *
 * The operator only observes; actions, their order and their scheduling are unchanged. Because
 * it wraps the request's own observable, outcomes stay attached to their request without
 * correlation ids, and a request torn down before an outcome — for example when `switchMap`
 * replaces it with a newer one — is recorded as `cancelled` with reason `superseded`. Owners
 * close the scope before tearing flows down, so unload and disposal keep their own reasons.
 *
 * @template TAction - The store action type, passed through unchanged.
 * @param telemetry - Scope that times and records attempts; absent telemetry adds no work.
 * @param operation - Static kebab-case operation label, e.g. `load-manifest`.
 * @param outcomes - Success and failure matchers of the measured async action.
 * @param describeSuccess - Optional static identity learned from the success action itself,
 *   such as a validated version, since owners apply it to state only after delivery.
 * @returns An operator to apply to the flow's per-request inner observable.
 */
export function measureStage<TAction extends StageAction>(
  telemetry: OperationalTelemetry | undefined,
  operation: string,
  outcomes: StageOutcomes<TAction>,
  describeSuccess?: (action: TAction) => OperationalProperties,
): MonoTypeOperatorFunction<TAction> {
  // Without a scope there is nothing to record, so the flow is left untouched.
  if (!telemetry) {
    return identity;
  }
  return (source) =>
    defer(() => {
      const end = telemetry.reserve(operation);
      // Closed scopes, absent telemetry and saturation retain no observer.
      if (!end) {
        return source;
      }
      // Observe only; actions pass through unchanged and keep their original scheduling.
      return source.pipe(
        tap((action) => {
          // The first terminal action ends the attempt; intermediate setters are ignored.
          if (outcomes.success.match(action)) {
            end('success', describeSuccess?.(action));
          } else if (outcomes.failure.match(action)) {
            end('failure', { reason: reasonOf(action.payload) });
          }
        }),
        // A no-op after an outcome; otherwise the request ended without one.
        finalize(() => end('cancelled', { reason: 'superseded' })),
      );
    });
}

/**
 * Reads only a classified error `type`, never the message, cause or stack.
 * @param error - Failure payload from the store.
 * @returns A static reason code.
 */
function reasonOf(error: unknown): string {
  const type =
    error && typeof error === 'object' && 'type' in error ? (error as { type: unknown }).type : '';
  return (typeof type === 'string' && reasons[type]) || 'error';
}
