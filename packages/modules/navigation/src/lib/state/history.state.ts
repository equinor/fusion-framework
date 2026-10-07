import type { FlowState } from '@equinor/fusion-observable';
import type { actions } from './actions.js';
import type { HistoryStack, LocationState } from '../types.js';

/**
 * History state containing flow state and stack.
 */
export type HistoryState = FlowState<LocationState, typeof actions> & {
  stack: HistoryStack;
};

/**
 * Default flows for history state management.
 */
