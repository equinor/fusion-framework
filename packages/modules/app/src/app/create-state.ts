import { FlowSubject } from '@equinor/fusion-observable';

import { createReducer } from './create-reducer';

import { handleFetchManifest, handleFetchConfig, handleImportApplication } from './flows';

import type { Actions } from './actions';
import type { AppBundleState, AppBundleStateInitial } from './types';
import type { AppModuleProvider } from '../AppModuleProvider';

export const createState = (
    value: AppBundleStateInitial,
    provider: AppModuleProvider,
): FlowSubject<AppBundleState, Actions> => {
    const reducer = createReducer(value);
    const state = new FlowSubject<AppBundleState, Actions>(reducer);
    state.addFlow(handleFetchManifest(provider));
    state.addFlow(handleFetchConfig(provider));
    state.addFlow(handleImportApplication());
    return state;
};
