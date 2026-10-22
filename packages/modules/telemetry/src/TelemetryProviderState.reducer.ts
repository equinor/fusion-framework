import { createReducer, type ReducerWithInitialState } from '@equinor/fusion-observable';

import {
  type TelemetryProviderAction,
  telemetryProviderActions as actions,
} from './TelemetryProviderState.actions.js';

/** Provider lifecycle: records are accepted until disposal starts and emitted until it closes. */
export type TelemetryProviderStatus = 'idle' | 'initializing' | 'ready' | 'disposing' | 'disposed';

/** One pipeline health failure, retaining its first occurrence for reporting. */
export interface TelemetryProviderFailure {
  /** First reported error; later occurrences only increase the count. */
  error: Error;
  /** Number of occurrences, summarized at teardown when greater than one. */
  count: number;
}

/**
 * Snapshot of a telemetry provider's lifecycle, in-flight work and health.
 *
 * Records never enter state; they flow through the provider's record stream so adapter
 * delivery stays synchronous and allocation-free.
 */
export interface TelemetryProviderSnapshot {
  status: TelemetryProviderStatus;
  /** Shared initialization operation, joined by repeated `initialize()` calls. */
  initialization?: Promise<void>;
  /** Shared disposal operation, joined by repeated `dispose()` calls. */
  disposal?: Promise<void>;
  /** Metadata enrichment in flight; `builtIn` is drained before delivery closes. */
  enrichment: { pending: number; builtIn: number };
  /** Asynchronous adapter processing in flight, keyed by adapter identifier. */
  processing: Record<string, number>;
  /** Pipeline health failures keyed by message. */
  failures: Record<string, TelemetryProviderFailure>;
}

/**
 * Creates the reducer recording telemetry provider transitions.
 * @returns A reducer with a fresh idle initial snapshot.
 */
export function createTelemetryProviderReducer(): ReducerWithInitialState<
  TelemetryProviderSnapshot,
  TelemetryProviderAction
> {
  return createReducer<TelemetryProviderSnapshot, TelemetryProviderAction>(
    (): TelemetryProviderSnapshot => ({
      status: 'idle',
      enrichment: { pending: 0, builtIn: 0 },
      processing: {},
      failures: {},
    }),
    (builder) =>
      builder
        .addCase(actions.initialize, (state, { meta }) => {
          state.initialization = meta.operation;
          // Only an idle provider starts; disposal already in progress keeps its status.
          if (state.status === 'idle') {
            state.status = 'initializing';
          }
        })
        .addCase(actions.initialize.success, (state) => {
          // Disposal requested during initialization wins over late readiness.
          if (state.status === 'initializing') {
            state.status = 'ready';
          }
        })
        .addCase(actions.dispose, (state, { meta }) => {
          state.disposal = meta.operation;
          state.status = 'disposing';
        })
        .addCase(actions.close, (state) => {
          state.status = 'disposed';
        })
        .addCase(actions.enrichmentStarted, (state, { payload }) => {
          state.enrichment.pending++;
          // Only bounded built-in enrichment delays shutdown; custom enrichment is canceled.
          if (payload.builtIn) {
            state.enrichment.builtIn++;
          }
        })
        .addCase(actions.enrichmentSettled, (state, { payload }) => {
          state.enrichment.pending--;
          // Mirror the start transition so the shutdown drain condition stays exact.
          if (payload.builtIn) {
            state.enrichment.builtIn--;
          }
        })
        .addCase(actions.processingStarted, (state, { payload }) => {
          state.processing[payload] = (state.processing[payload] ?? 0) + 1;
        })
        .addCase(actions.processingSettled, (state, { payload }) => {
          state.processing[payload] = (state.processing[payload] ?? 1) - 1;
        })
        .addCase(actions.failed, (state, { payload }) => {
          const failure = state.failures[payload.message];
          // The first occurrence is retained for reporting; repeats only count.
          if (failure) {
            failure.count++;
          } else {
            state.failures[payload.message] = { error: payload, count: 1 };
          }
        }),
  );
}
