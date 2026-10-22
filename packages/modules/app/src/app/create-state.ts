import { FlowSubject, type Flow } from '@equinor/fusion-observable';
import { tap } from 'rxjs';

import { createReducer } from './create-reducer.js';

import {
  handleFetchManifest,
  handleFetchConfig,
  handleFetchSettings,
  handleUpdateSettings,
  handleImportApplication,
} from './flows/index.js';

import type { Actions } from './actions.js';
import type { AppBundleState, AppBundleStateInitial } from './types.js';
import type { AppModuleProvider } from '../AppModuleProvider.js';

/**
 * Creates and configures the reactive state machine ({@link FlowSubject}) for
 * an {@link App} instance.
 *
 * Registers flows for fetching manifests, configs, settings, and importing
 * the application script module.
 *
 * @param value - Initial state values (appKey, tag, and any pre-loaded data).
 * @param provider - The {@link AppModuleProvider} used by flows to fetch data.
 * @param onFlowAction - Optional observer of flow outputs before scheduled store delivery.
 * @returns A configured `FlowSubject` ready for use by the App class.
 */
export const createState = (
  value: AppBundleStateInitial,
  provider: AppModuleProvider,
  onFlowAction?: (action: Actions) => void,
): FlowSubject<AppBundleState, Actions> => {
  const reducer = createReducer(value);

  // create state
  const state = new FlowSubject<AppBundleState, Actions>(reducer);
  // Observe requests before any flow can synchronously emit its terminal action.
  if (onFlowAction) {
    state.action$.subscribe(onFlowAction);
  }
  /** Observe emitted terminal actions without changing FlowSubject's scheduling. */
  const addFlow = (flow: Flow<Actions, AppBundleState>): void => {
    state.addFlow((action$, state$) => {
      // The tap runs before addFlow's asyncScheduler boundary.
      return flow(action$, state$).pipe(tap(onFlowAction));
    });
  };

  // add handler for fetching manifest
  addFlow(handleFetchManifest(provider));

  // add handler for fetching config
  addFlow(handleFetchConfig(provider));

  // add handler for fetching settings
  addFlow(handleFetchSettings(provider));

  addFlow(handleUpdateSettings(provider));

  // add handler for loading application script
  addFlow(handleImportApplication(provider));

  return state;
};
