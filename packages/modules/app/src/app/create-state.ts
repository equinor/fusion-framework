import { FlowSubject } from '@equinor/fusion-observable';

import { createReducer } from './create-reducer';

import {
  handleFetchManifest,
  handleFetchConfig,
  handleFetchSettings,
  handleUpdateSettings,
  handleImportApplication,
} from './flows';

import type { Actions } from './actions';
import type { AppBundleState, AppBundleStateInitial } from './types';
import type { AppModuleProvider } from '../AppModuleProvider';

/**
 * Creates and configures the reactive state machine ({@link FlowSubject}) for
 * an {@link App} instance.
 *
 * Registers flows for fetching manifests, configs, settings, and importing
 * the application script module.
 *
 * @param value - Initial state values (appKey, tag, and any pre-loaded data).
 * @param provider - The {@link AppModuleProvider} used by flows to fetch data.
 * @returns A configured `FlowSubject` ready for use by the App class.
 */
export const createState = (
  value: AppBundleStateInitial,
  provider: AppModuleProvider,
): FlowSubject<AppBundleState, Actions> => {
  const reducer = createReducer(value);

  // create state
  const state = new FlowSubject<AppBundleState, Actions>(reducer);

  // add handler for fetching manifest
  state.addFlow(handleFetchManifest(provider));

  // add handler for fetching config
  state.addFlow(handleFetchConfig(provider));

  // add handler for fetching settings
  state.addFlow(handleFetchSettings(provider));

  state.addFlow(handleUpdateSettings(provider));

  // add handler for loading application script
  state.addFlow(handleImportApplication(provider));

  return state;
};
