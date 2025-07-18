import { createReducer } from '@equinor/fusion-observable';

import { actions } from './StateProvider.actions';
import type { State } from './StateProvider.store';

export const makeReducer = (initial: State) =>
  createReducer(initial, (builder) => {
    builder.addCase(actions.setItems, (state, action) => {
      const { items } = action.payload;
      for (const item of items) {
        state.items[item.key] = item;
      }
    });
  });

export default makeReducer;

