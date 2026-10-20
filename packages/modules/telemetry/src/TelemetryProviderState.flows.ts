import {
  type Observable,
  catchError,
  concat,
  defer,
  exhaustMap,
  filter,
  from,
  ignoreElements,
  map,
  of,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';
import type { Flow } from '@equinor/fusion-observable';

import {
  type TelemetryInitializeArgs,
  type TelemetryProviderAction,
  telemetryProviderActions as actions,
} from './TelemetryProviderState.actions.js';
import type {
  TelemetryProviderSnapshot,
  TelemetryProviderStatus,
} from './TelemetryProviderState.reducer.js';

/** Work the flows delegate to the engine that owns exporters and subscriptions. */
export interface TelemetryProviderFlowHandlers {
  /** Initializes exporters and connects delivery, the parent relay and startup streams. */
  connect(args?: TelemetryInitializeArgs): Promise<void>;
  /** Releases delivery subscriptions and completes the record stream. */
  close(): void;
  /** Flushes and shuts down every exporter; rejects with an `AggregateError` on failure. */
  shutdown(): Promise<void>;
  /** Reports the first occurrence of a pipeline failure through the health channel. */
  report(error: Error, status: TelemetryProviderStatus): void;
}

type ProviderFlow = Flow<TelemetryProviderAction, TelemetryProviderSnapshot>;

/**
 * Emits once state satisfies a condition, immediately when it already does.
 * @param state$ - Provider state stream.
 * @param predicate - Condition over the snapshot.
 * @returns A single emission of the first matching snapshot.
 */
const whenState = (
  state$: Observable<TelemetryProviderSnapshot>,
  predicate: (snapshot: TelemetryProviderSnapshot) => boolean,
): Observable<TelemetryProviderSnapshot> =>
  // Only the first matching snapshot gates the next step.
  state$.pipe(filter(predicate), take(1));

/**
 * Connects the provider once per initialize request and settles the shared operation.
 * @param handlers - Engine work.
 * @returns A flow emitting `initialize.success` or `initialize.failure`.
 */
const initializeFlow =
  (handlers: TelemetryProviderFlowHandlers): ProviderFlow =>
  (action$) =>
    // Repeated requests join the running operation, so ignore them while it is in flight.
    action$.pipe(
      filter(actions.initialize.match),
      exhaustMap(({ payload }) =>
        // Connecting is the operation; its outcome settles every joined caller.
        from(handlers.connect(payload)).pipe(
          map(() => actions.initialize.success()),
          catchError((error) => of(actions.initialize.failure(error))),
        ),
      ),
    );

/**
 * Drains owned work in order, closes delivery and shuts down exporters once.
 *
 * Order: initialization settles → bounded built-in enrichment drains → delivery closes
 * (canceling custom enrichment) → asynchronous adapter processing drains → repeated failures
 * are summarized → exporters shut down.
 *
 * @param handlers - Engine work.
 * @returns A flow emitting `close`, then `dispose.success` or `dispose.failure`.
 */
const disposeFlow =
  (handlers: TelemetryProviderFlowHandlers): ProviderFlow =>
  (action$, state$) =>
    // Disposal runs once; later requests join the same operation instead.
    action$.pipe(
      filter(actions.dispose.match),
      exhaustMap(() => {
        // An in-flight initialization finishes before anything is torn down.
        const initialized$ = whenState(state$, () => true).pipe(
          exhaustMap(({ initialization }) => from(Promise.allSettled([initialization]))),
          ignoreElements(),
        );
        // Built-in enrichment has a deadline; retain terminal teardown records before closing.
        const closed$ = whenState(state$, ({ enrichment }) => enrichment.builtIn === 0).pipe(
          tap(() => handlers.close()),
          map(() => actions.close()),
        );
        // Accepted asynchronous processing is owned and must settle before exporters shut down.
        const drained$ = whenState(state$, ({ processing }) =>
          // Every adapter must be drained, not just the one that settled last.
          Object.values(processing).every((pending) => !pending),
        ).pipe(
          tap(({ failures }) => {
            // Repeated failures stay visible without one event per failed record.
            for (const [failure, { count }] of Object.entries(failures)) {
              // A single occurrence was already reported; summarize only repeats.
              if (count > 1) {
                console.warn('Telemetry pipeline failure summary', { failure, count });
              }
            }
          }),
          ignoreElements(),
        );
        // Shutdown is attempted for every exporter; its outcome settles the operation.
        const shutdown$ = defer(() => from(handlers.shutdown())).pipe(
          map(() => actions.dispose.success()),
          catchError((error) => of(actions.dispose.failure(error))),
        );
        return concat(initialized$, closed$, drained$, shutdown$);
      }),
    );

/**
 * Reports each pipeline failure once, when it first appears in state.
 * @param handlers - Engine work.
 * @returns A flow that only performs reporting and emits no actions.
 */
const failureFlow =
  (handlers: TelemetryProviderFlowHandlers): ProviderFlow =>
  (action$, state$) =>
    // Pair each failure with the snapshot that already counted it.
    action$.pipe(
      filter(actions.failed.match),
      withLatestFrom(state$),
      // Only the first occurrence is actionable; repeats are summarized at teardown.
      filter(([{ payload }, { failures }]) => failures[payload.message]?.count === 1),
      tap(([{ payload }, { status }]) => handlers.report(payload, status)),
      ignoreElements(),
    );

/**
 * Creates the flows driving a telemetry provider's operations and health reporting.
 * @param handlers - Engine work the flows delegate to.
 * @returns Flows to register on provider state.
 */
export function createTelemetryProviderFlows(
  handlers: TelemetryProviderFlowHandlers,
): ProviderFlow[] {
  return [initializeFlow(handlers), disposeFlow(handlers), failureFlow(handlers)];
}
