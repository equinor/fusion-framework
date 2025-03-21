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
