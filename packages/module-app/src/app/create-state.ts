import { FlowSubject } from '@equinor/fusion-observable';

import { createReducer } from './create-reducer';

import { handleFetchManifest, handleFetchConfig, handleImportApplication } from './flows';

import type { Actions } from './actions';
import type { AppBundleState } from './types';
import type { AppModuleProvider } from '../AppModuleProvider';

export const createState = (
    appKey: string,
    provider: AppModuleProvider
): FlowSubject<AppBundleState, Actions> => {
    const reducer = createReducer(appKey);
    const state = new FlowSubject<AppBundleState, Actions>(reducer);
    state.addFlow(handleFetchManifest(provider));
    state.addFlow(handleFetchConfig(provider));
    state.addFlow(handleImportApplication());
    return state;
};

