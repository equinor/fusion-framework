import { castDraft, createReducer } from '@equinor/fusion-observable';

import { actions } from './actions';
import { State } from './state';
import { FeatureFlag } from '../FeatureFlag';

export const identifyFeatureFlag = (flag: Pick<FeatureFlag, 'name' | 'version'>): string => {
    const { name, version } = flag;
    if (name.includes('@') || version === undefined) {
        return name;
    }
    return [name, version].join('@');
};

export const makeReducer = (initial: State) =>
    createReducer(initial, (builder) => {
        builder
            .addCase(actions.setFeature, (state, action) => {
                const { key } = action.payload;
                state.features[key] = castDraft(action.payload);
            })
            .addCase(actions.setFeatureEnabled, (state, action) => {
                const { key, enabled } = action.payload;
                const flag = state.features[key] ?? {};
                flag.enabled = !!enabled;
                state.features[key] = flag;
            })
            .addCase(actions.setFeaturesEnabled, (state, action) => {
                action.payload.forEach((entry) => {
                    const { key, enabled } = entry;
                    const flag = state.features[key] ?? {};
                    flag.enabled = !!enabled;
                    state.features[key] = flag;
                });
            });
    });
