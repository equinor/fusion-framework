import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Flow } from '@equinor/fusion-observable';
import { filterAction } from '@equinor/fusion-observable/operators';
import { actions, type Actions } from './actions';
import { resolvePath } from '../utils';
import { type Location, type LocationState, type HistoryStack, Action } from '../types';

/** History flow for processing navigation actions. */
export type HistoryFlow = Flow<Actions, LocationState>;

/** Factory function that creates a history flow from a stack. */
export type HistoryFlowCreator = (stack: HistoryStack) => HistoryFlow;

const compareLocation = (a: Location, b: Location): boolean => {
  return (
    a.hash === b.hash &&
    a.search === b.search &&
    a.pathname === b.pathname &&
    JSON.stringify(a.state) === JSON.stringify(b.state)
  );
};

/** Flow creator for handling navigate actions. */
export const navigate: HistoryFlowCreator =
  (stack: HistoryStack): HistoryFlow =>
  (action$: Observable<Actions>) => {
    const { navigate } = actions;
    // Transform matching navigation actions into stack updates and success actions.
    return action$.pipe(
      filterAction(navigate.type),
      map((action) => {
        const { payload, meta } = action;
        const path = resolvePath(payload.to);
        const nextLocation = {
          ...path,
          key: meta.key,
          state: payload.options.state,
          unstable_mask: undefined,
        } satisfies Location;
        // Abort duplicate navigations to prevent a feedback loop in history state.
        if (compareLocation(nextLocation, stack.current)) {
          return actions.abortNavigate('Location is the same as the current location');
        }
        // Apply replacement or append semantics selected by the navigation request.
        if (payload.options.replace) {
          stack.replace(nextLocation);
        } else {
          stack.push(nextLocation);
        }
        return navigate.success({
          delta: 0,
          action: payload.options.replace ? Action.Replace : Action.Push,
          location: nextLocation,
        });
      }),
    );
  };
