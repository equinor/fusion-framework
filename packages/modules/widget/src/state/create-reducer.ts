import {
  getBaseType,
  createReducer as makeReducer,
  isCompleteAction,
  isRequestAction,
} from '@equinor/fusion-observable';

import { enableMapSet } from 'immer';

enableMapSet();

import { type Actions, actions } from './actions';
import type { WidgetStateInitial, WidgetState } from '../types';

/**
 * Creates an Immer-powered reducer for the widget state machine.
 *
 * Handles direct state setters (`setManifest`, `setConfig`, `setModule`,
 * `setInstance`) and tracks in-flight async operations via the `status` set.
 *
 * @param value - Initial widget state (without `status`, which is added
 *   automatically as an empty `Set`).
 * @returns A reducer function compatible with `FlowSubject`.
 */
export const createReducer = (value: WidgetStateInitial) =>
  makeReducer<WidgetState, Actions>({ ...value, status: new Set() } as WidgetState, (builder) =>
    builder
      .addCase(actions.setManifest, (state, action) => {
        if (action.meta.update) {
          state.manifest = { ...state.manifest, ...action.payload };
        } else {
          state.manifest = action.payload;
        }
      })
      .addCase(actions.setConfig, (state, action) => {
        state.config = action.payload;
      })
      .addCase(actions.setModule, (state, action) => {
        state.modules = action.payload;
      })
      .addCase(actions.setInstance, (state, action) => {
        state.instance = action.payload;
      })
      /** mark status as loading {{type}} */
      .addMatcher(isRequestAction, (state, action) => {
        state.status.add(getBaseType(action.type));
      })
      /** clear status {{type}} */
      .addMatcher(isCompleteAction, (state, action) => {
        state.status.delete(getBaseType(action.type));
      }),
  );

export default createReducer;
