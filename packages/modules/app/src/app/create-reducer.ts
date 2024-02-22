import {
    actionBaseType,
    createReducer as makeReducer,
    isCompleteAction,
    isRequestAction,
} from '@equinor/fusion-observable';

import { enableMapSet } from 'immer';

enableMapSet();

import { actions } from './actions';

import { AppBundleState, AppBundleStateInitial } from './types';

export const createReducer = (value: AppBundleStateInitial) =>
    makeReducer({ ...value, status: new Set() } as AppBundleState, (builder) =>
        builder
            // update or set manifest
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
            // add status which indicates that a request is in progress
            .addMatcher(isRequestAction, (state, action) => {
                state.status.add(actionBaseType(action));
            })
            // remove status when a request is complete
            .addMatcher(isCompleteAction, (state, action) => {
                state.status.delete(actionBaseType(action));
            }),
    );

export default createReducer;
