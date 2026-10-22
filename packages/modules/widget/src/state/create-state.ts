import { FlowSubject, type Flow } from '@equinor/fusion-observable';
import { tap } from 'rxjs';

import { createReducer } from './create-reducer.js';

import { handleFetchManifest, handleImportWidget, handleFetchConfig } from './flows.js';

import type { Actions } from './actions.js';
import type { WidgetState, WidgetStateInitial } from '../types.js';
import type WidgetModuleProvider from '../WidgetModuleProvider.js';

/**
 * Creates and wires the RxJS-based `FlowSubject` state machine for a single
 * widget.
 *
 * Attaches the manifest-fetch, script-import, and config-fetch flows to the
 * subject so that dispatched actions trigger the corresponding side effects.
 *
 * @param value - Initial widget state (name and optional pre-loaded data).
 * @param provider - The {@link WidgetModuleProvider} used by flows to query
 *   the backend API.
 * @param onFlowAction - Optional observer of flow outputs before scheduled store delivery.
 * @returns A `FlowSubject` managing {@link WidgetState} via {@link Actions}.
 */
export const createState = (
  value: WidgetStateInitial,
  provider: WidgetModuleProvider,
  onFlowAction?: (action: Actions) => void,
): FlowSubject<WidgetState, Actions> => {
  const reducer = createReducer(value);
  const state = new FlowSubject<WidgetState, Actions>(reducer);
  // Observe requests before any flow can synchronously emit its terminal action.
  if (onFlowAction) {
    state.action$.subscribe(onFlowAction);
  }
  /** Observe emitted terminal actions without changing FlowSubject's scheduling. */
  const addFlow = (flow: Flow<Actions, WidgetState>): void => {
    state.addFlow((action$, state$) => {
      // The tap runs before addFlow's asyncScheduler boundary.
      return flow(action$, state$).pipe(tap(onFlowAction));
    });
  };
  addFlow(handleFetchManifest(provider));
  addFlow(handleImportWidget());
  addFlow(handleFetchConfig(provider));
  return state;
};
