import type { ObservableInput } from 'rxjs';
import { createAction, createAsyncAction } from '@equinor/fusion-observable/actions';
import type { ActionTypes } from '@equinor/fusion-observable/actions';

import type { ITelemetryProvider } from './TelemetryProvider.interface.js';
import type { TelemetryItem } from './types.js';

/** Inputs for connecting a telemetry provider to exporters, a parent and startup streams. */
export interface TelemetryInitializeArgs {
  /** Ancestor provider receiving relayed records. */
  parent?: ITelemetryProvider;
  /** Startup records tracked once the provider is connected. */
  initialItems?: ObservableInput<TelemetryItem>;
}

/**
 * Actions describing a telemetry provider's lifecycle, in-flight work and health.
 *
 * `initialize` and `dispose` are async actions: the request carries the shared operation
 * promise, flows perform the work, and the success or failure action settles that promise.
 */
export const telemetryProviderActions = {
  /** Connects exporters, the parent relay and startup streams once. */
  initialize: createAsyncAction(
    'telemetry/initialize',
    (args: TelemetryInitializeArgs | undefined, operation: Promise<void>) => ({
      payload: args,
      meta: { operation },
    }),
    () => ({ payload: undefined }),
    (error: unknown) => ({ payload: error }),
  ),
  /** Drains owned work, closes delivery and shuts down exporters once. */
  dispose: createAsyncAction(
    'telemetry/dispose',
    (operation: Promise<void>) => ({ payload: undefined, meta: { operation } }),
    () => ({ payload: undefined }),
    (error: unknown) => ({ payload: error }),
  ),
  /** Delivery closed after bounded built-in enrichment drained; custom enrichment is canceled. */
  close: createAction('telemetry/close'),
  /** One metadata enrichment entered flight; built-in enrichment is awaited at shutdown. */
  enrichmentStarted: createAction('telemetry/enrichment/started', (builtIn: boolean) => ({
    payload: { builtIn },
  })),
  /** One metadata enrichment left flight. */
  enrichmentSettled: createAction('telemetry/enrichment/settled', (builtIn: boolean) => ({
    payload: { builtIn },
  })),
  /** Asynchronous processing entered flight for one adapter. */
  processingStarted: createAction('telemetry/processing/started', (adapter: string) => ({
    payload: adapter,
  })),
  /** Asynchronous processing left flight for one adapter. */
  processingSettled: createAction('telemetry/processing/settled', (adapter: string) => ({
    payload: adapter,
  })),
  /** A pipeline health failure occurred; occurrences are counted by message. */
  failed: createAction('telemetry/failed', (error: Error) => ({ payload: error })),
};

/** Action definitions accepted by telemetry provider state. */
export type TelemetryProviderActions = typeof telemetryProviderActions;

/** Any action dispatched to telemetry provider state. */
export type TelemetryProviderAction = ActionTypes<TelemetryProviderActions>;
