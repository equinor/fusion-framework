import { FlowSubject } from '@equinor/fusion-observable';

import { createReducer } from './create-reducer';

import { handleFetchManifest, handleImportWidget, handleFetchConfig } from './flows';

import type { Actions } from './actions';
import type { WidgetState, WidgetStateInitial } from '../types';
import type WidgetModuleProvider from '../WidgetModuleProvider';

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
 * @returns A `FlowSubject` managing {@link WidgetState} via {@link Actions}.
 */
export const createState = (
  value: WidgetStateInitial,
  provider: WidgetModuleProvider,
): FlowSubject<WidgetState, Actions> => {
  const reducer = createReducer(value);
  const state = new FlowSubject<WidgetState, Actions>(reducer);
  state.addFlow(handleFetchManifest(provider));
  state.addFlow(handleImportWidget());
  state.addFlow(handleFetchConfig(provider));
  return state;
};
