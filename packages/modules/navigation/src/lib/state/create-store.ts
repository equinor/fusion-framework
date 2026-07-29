import { createState, type ReducerWithInitialState } from '@equinor/fusion-observable';
import { actions, type Actions } from './actions';
import { flowCreators } from './flow-creators';
import { createFlow } from './create-flow';
import type { HistoryFlowCreator } from './navigate';
import type { HistoryStack, LocationState } from '../types';
import type { HistoryState } from './history.state';

/**
 * Creates a history store with the specified stack and reducer.
 * @param stack - The history stack implementation.
 * @param reducer - The reducer that handles state transitions.
 * @param options - Optional flow configuration.
 * @returns A fully-initialized history state with flows attached.
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
  // Attach the stack onto the created state so flows can reach it without prop-drilling.
  const state = Object.assign(createState(actions, reducer), { stack }) as HistoryState;
  const flows = new Set<HistoryFlowCreator>(
    options?.flows ?? [flowCreators.navigate, flowCreators.go, flowCreators.pop],
  );
  // Validation is opt-in since it re-checks the current location on every relevant action.
  if (options?.validateCurrentLocation) {
    flows.add(flowCreators.validateCurrentLocation);
  }
  const flow = createFlow([...flows], {
    skipBlockCheck: options?.skipBlockCheck,
  });
  state.subject.addFlow(flow(stack));
  return state;
};
