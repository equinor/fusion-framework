import { defer, finalize, identity, tap, type MonoTypeOperatorFunction } from 'rxjs';
import type { OperationalTelemetry } from '@equinor/fusion-framework-module-telemetry';

/** Terminal action matchers of one async bookmark action, e.g. `bookmarkActions.fetchBookmark`. */
export interface RequestOutcomes<TAction> {
  success: { match: (action: TAction) => boolean };
  failure: { match: (action: TAction) => boolean };
}

/**
 * Measures each request a store flow executes: subscribing to the flow's per-request inner
 * observable starts the attempt, and its first success or failure action ends it.
 *
 * Observing the request itself keeps each outcome with its request, so a request replaced by a
 * newer one — `switchMap` tears it down — is recorded as `cancelled` with reason `superseded`.
 * Calls absorbed by the flow's throttling never execute and therefore record nothing.
 *
 * @template TAction - The store action type, passed through unchanged.
 * @param telemetry - Scope that records attempts; without it the flow is left untouched.
 * @param operation - Static operation label, e.g. `get`.
 * @param outcomes - Success and failure matchers of the measured async action.
 * @returns An operator for the flow's per-request inner observable.
 */
export function measureRequest<TAction>(
  telemetry: (() => OperationalTelemetry | undefined) | undefined,
  operation: string,
  outcomes: RequestOutcomes<TAction>,
): MonoTypeOperatorFunction<TAction> {
  // Without a scope there is nothing to record, so the flow is left untouched.
  if (!telemetry) {
    return identity;
  }
  return (source) =>
    defer(() => {
      const end = telemetry()?.reserve(operation);
      // Closed scopes, absent telemetry and saturation retain no observer.
      if (!end) {
        return source;
      }
      // Observe only; actions pass through unchanged and keep their original scheduling.
      return source.pipe(
        tap((action) => {
          // The first terminal action ends the attempt.
          if (outcomes.success.match(action) || outcomes.failure.match(action)) {
            end(outcomes.success.match(action) ? 'success' : 'failure');
          }
        }),
        // A no-op after an outcome; otherwise the request ended without one.
        finalize(() => end('cancelled', { reason: 'superseded' })),
      );
    });
}
