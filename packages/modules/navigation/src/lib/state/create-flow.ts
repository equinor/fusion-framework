import { merge, type Observable } from 'rxjs';
import type { HistoryFlow, HistoryFlowCreator } from './navigate';
import { checkBlockers } from './check-blockers';
import type { Actions } from './actions';
import type { HistoryStack, LocationState } from '../types';

/**
 * Creates a combined history flow from multiple flow creators.
 * @param flowCreators - Flow creators to combine.
 * @param options - Optional blocker configuration.
 * @returns A combined history flow creator.
 */
export const createFlow = (
  flowCreators: HistoryFlowCreator[],
  options?: { skipBlockCheck?: boolean },
): HistoryFlowCreator => {
  return (stack: HistoryStack): HistoryFlow => {
    const preProcessActions = options?.skipBlockCheck
      ? (action$: Observable<Actions>) => action$
      : checkBlockers(stack);
    const flows: HistoryFlow = (
      action$: Observable<Actions>,
      state$: Observable<LocationState>,
    ) => {
      // Initialize each creator against the same stack before merging their action streams.
      const initializedFlows = flowCreators
        .map((initializer) => initializer(stack))
        .map((flow) => flow(action$, state$));
      return merge(...initializedFlows);
    };
    return (action$: Observable<Actions>, state$: Observable<LocationState>) => {
      // Gate actions before dispatching them to the parallel history flows.
      return preProcessActions(action$, state$).pipe((source$) => flows(source$, state$));
    };
  };
};
