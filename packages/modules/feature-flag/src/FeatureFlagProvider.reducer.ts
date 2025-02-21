import { createReducer } from '@equinor/fusion-observable';

import { actions } from './FeatureFlagProvider.actions';
import type { State } from './FeatureFlagProvider.state';

export const makeReducer = (initial: State) =>
  createReducer(initial, (builder) => {
    builder.addCase(actions.setFeatures, (state, action) => {
      for (const flag of action.payload) {
        state.features[flag.key] = flag;
      }
    });
    builder.addCase(actions.toggleFeatures, (state, action) => {
      const filteredFlags = action.payload.filter((flag) => flag.key in state.features);
      for (const flag of filteredFlags) {
        const { key } = flag;
        state.features[key].enabled = !!flag.enabled;
      }
    });
  });

export default makeReducer;
