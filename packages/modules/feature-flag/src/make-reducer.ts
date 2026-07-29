import { createReducer } from '@equinor/fusion-observable';

import { actions } from './actions';
import type { State } from './create-state';

/**
 * Creates the Immer-based reducer that handles feature-flag state mutations.
 *
 * @param initial - The initial {@link State} snapshot.
 * @returns A reducer function compatible with `FlowSubject`.
 */
export const makeReducer = (initial: State) =>
  createReducer(initial, (builder) => {
    builder.addCase(actions.setFeatures, (state, action) => {
      // overwrite (or add) each flag in state by its key
      for (const flag of action.payload) {
        state.features[flag.key] = flag;
      }
    });
    builder.addCase(actions.toggleFeatures, (state, action) => {
      // ignore toggles for flags that aren't currently registered in state
      const filteredFlags = action.payload.filter((flag) => flag.key in state.features);
      // flip the enabled state for each remaining flag
      for (const flag of filteredFlags) {
        const { key } = flag;
        state.features[key].enabled = !!flag.enabled;
      }
    });
  });

export default makeReducer;
