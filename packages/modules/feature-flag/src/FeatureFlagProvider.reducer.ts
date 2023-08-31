import { createReducer } from '@equinor/fusion-observable';

import { actions } from './FeatureFlagProvider.actions';
import { State } from './FeatureFlagProvider.state';

export const makeReducer = (initial: State) =>
    createReducer(initial, (builder) => {
        builder.addCase(actions.setFeatures, (state, action) => {
            action.payload.forEach((flag) => {
                state.features[flag.key] = flag;
            });
        });
        builder.addCase(actions.toggleFeatures, (state, action) => {
            action.payload
                .filter((flag) => flag.key in state.features)
                .forEach((flag) => {
                    const { key } = flag;
                    state.features[key].enabled = !!flag.enabled;
                });
        });
    });

export default makeReducer;
