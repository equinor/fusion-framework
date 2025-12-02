import { createReducer } from '@equinor/fusion-observable';
import type { LocationState, NavigationUpdate } from '../types';
import { actions, type Actions } from './history.actions';
import { isSuccessAction } from '@equinor/fusion-observable/actions';

/**
 * Finds the index of the current location in the history array.
 * Used to determine where to insert/replace entries for REPLACE actions.
 */
const findIndex = (state: LocationState) => {
  return state.history.findIndex((update) => update.location.key === state.current.location.key);
};

/**
 * Creates a reducer for history state management.
 *
 * @param initial - Initial navigation update or function that returns initial state
 * @param options - Optional configuration options
 * @param options.maxHistory - Maximum number of history entries to keep (default: 100)
 * @returns A reducer for history state
 */
export const createHistoryReducer = (
  initial: NavigationUpdate | (() => LocationState),
  options?: { maxHistory?: number },
) => {
  const maxHistory = options?.maxHistory ?? 100;

  const initialState: LocationState =
    initial instanceof Function
      ? initial()
      : ({
          current: initial,
          history: [initial],
          blockers: [],
        } satisfies LocationState);

  return createReducer<LocationState, Actions>(initialState, (builder) => {
    // Handle navigate.success actions to update history array
    builder.addCase(actions.navigate.success, (state, action) => {
      const { update } = action.payload;
      // For REPLACE actions, remove all entries after the current location (the tail)
      // This ensures REPLACE doesn't add to history length when at the end,
      // and removes any forward history when not at the end
      if (update.action === 'REPLACE') {
        const currentIndex = findIndex(state);
        if (currentIndex !== -1) {
          // Remove all entries from current position onwards
          state.history.splice(currentIndex, state.history.length - currentIndex);
        }
      }
      state.history.push(update);
    });
    // Update current location for all successful actions (navigate, go, pop, etc.)
    builder.addMatcher(isSuccessAction, (state, action) => {
      const { update } = action.payload;
      state.current = update;
    });
    // Limit history size to prevent unbounded growth
    // This matcher always runs (returns true) to check history length after every action
    builder.addMatcher(
      () => true,
      (state) => {
        if (state.history.length > maxHistory) {
          // Keep only the most recent entries, removing oldest ones
          state.history = state.history.slice(-maxHistory);
        }
      },
    );
  });
};
