import {
  getBaseType,
  createReducer as makeReducer,
  isCompleteAction,
  isRequestAction,
} from '@equinor/fusion-observable';

import { enableMapSet } from 'immer';

enableMapSet();

import { type Actions, actions } from './actions';

import type { AppBundleState, AppBundleStateInitial } from './types';

export const createReducer = (value: AppBundleStateInitial) =>
  makeReducer<AppBundleState, Actions>(
    { ...value, status: new Set() } as AppBundleState,
    (builder) =>
      builder
        // update or set manifest
        .addCase(actions.setManifest, (state, action) => {
          // TODO: after legacy is removed, remove the update flag
          if (action.meta.update) {
            state.manifest = Object.assign(state.manifest ?? {}, action.payload);
          } else {
            state.manifest = action.payload;
          }
        })
        .addCase(actions.setConfig, (state, action) => {
          state.config = action.payload;
        })
        .addCase(actions.setSettings, (state, action) => {
          state.settings = action.payload;
        })
        .addCase(actions.setModule, (state, action) => {
          state.modules = action.payload;
        })
        .addCase(actions.setInstance, (state, action) => {
          state.instance = action.payload;
        })
        // add status which indicates that a request is in progress
        .addMatcher(isRequestAction, (state, action) => {
          state.status.add(getBaseType(action.type));
        })
        // remove status when a request is complete
        .addMatcher(isCompleteAction, (state, action) => {
          state.status.delete(getBaseType(action.type));
        }),
  );

export default createReducer;
