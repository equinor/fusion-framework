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

    // create state
    const state = new FlowSubject<AppBundleState, Actions>(reducer);

    // add handler for fetching manifest
    state.addFlow(handleFetchManifest(provider));

    // add handler for fetching config
    state.addFlow(handleFetchConfig(provider));

    // add handler for loading application script
    state.addFlow(handleImportApplication());

    return state;
};
