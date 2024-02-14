import { FlowSubject } from '@equinor/fusion-observable';

import { createReducer } from './create-reducer';

import { handleFetchManifest, handleImportWidget, handleFetchConfig } from './flows';

import type { Actions } from './actions';
import { WidgetState, WidgetStateInitial } from '../types';
import WidgetModuleProvider from '../WidgetModuleProvider';

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
