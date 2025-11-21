import {
  createState,
  type FlowState,
  type ReducerWithInitialState,
} from '@equinor/fusion-observable';
import { actions, type Actions } from './history.actions';
import { flowCreators, createFlow, type HistoryFlowCreator } from './history.flows';
import type { HistoryStack, LocationState } from '../types';

/**
 * History state containing flow state and stack.
 */
export type HistoryState = FlowState<LocationState, typeof actions> & {
  stack: HistoryStack;
};

/**
 * Default flows for history state management.
 */
export const defaultFlows = [flowCreators.navigate, flowCreators.go, flowCreators.pop];

/**
 * Creates a history store with the specified stack and reducer.
 *
 * @param stack - The history stack implementation
 * @param reducer - The reducer for history state
 * @param options - Optional configuration options
 * @returns A HistoryState instance
 */
export const createStore = (
  stack: HistoryStack,
  reducer: ReducerWithInitialState<LocationState, Actions>,
  options?: {
    flows?: HistoryFlowCreator[];
    skipBlockCheck?: boolean;
    validateCurrentLocation?: boolean;
  },
): HistoryState => {
  // Create base state with actions and reducer, then add stack property
  // The stack is stored alongside the flow state for use in flows
  const state = Object.assign(createState(actions, reducer), { stack }) as HistoryState;

  // Build set of flows to use (default flows or custom flows)
  // Use Set to ensure no duplicates if validateCurrentLocation is added
  const flows = new Set<HistoryFlowCreator>(options?.flows ?? defaultFlows);
  // Optionally add validation flow to check location consistency
  if (options?.validateCurrentLocation) {
    flows.add(flowCreators.validateCurrentLocation);
  }

  // Create combined flow from all flow creators
  // This merges all flows so they process actions in parallel
  const flow = createFlow([...flows], {
    skipBlockCheck: options?.skipBlockCheck,
  });

  // Initialize the flow with the stack and add it to the state subject
  // The flow processes actions and updates state through the reducer
  state.subject.addFlow(flow(stack));

  return state;
};
