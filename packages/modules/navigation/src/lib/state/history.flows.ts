import { Observable, of, merge } from 'rxjs';
import { concatMap, map, withLatestFrom } from 'rxjs/operators';
import type { Flow } from '@equinor/fusion-observable';
import { filterAction } from '@equinor/fusion-observable/operators';
import { actions, type Actions } from './history.actions';
import { resolvePath } from '../utils';
import { type Location, type LocationState, type HistoryStack, Action } from '../types';

/**
 * History flow for processing navigation actions.
 */
export type HistoryFlow = Flow<Actions, LocationState>;

/**
 * Factory function that creates a history flow from a stack.
 */
export type HistoryFlowCreator = (stack: HistoryStack) => HistoryFlow;

const compareLocation = (a: Location, b: Location) => {
  return (
    a.hash === b.hash &&
    a.search === b.search &&
    a.pathname === b.pathname &&
    JSON.stringify(a.state) === JSON.stringify(b.state)
  );
};

/**
 * Flow creator for handling navigate actions.
 *
 * Execution flow:
 * 1. Filters for navigate actions
 * 2. Resolves the target path from the action payload
 * 3. Creates a location object with the resolved path, key (from action meta), and optional state
 * 4. Checks if the new location is the same as current to prevent navigation loops
 * 5. Updates the stack based on replace option (replace updates current, otherwise pushes new entry)
 * 6. Returns success action with the new location and appropriate action type (PUSH/REPLACE)
 */
export const navigate: HistoryFlowCreator =
  (stack: HistoryStack): HistoryFlow =>
  (action$: Observable<Actions>) => {
    const { navigate } = actions;
    return action$.pipe(
      filterAction(navigate.type),
      map((action) => {
        const { payload, meta } = action;
        const path = resolvePath(payload.to);
        const key = meta.key;
        const { replace, state } = payload.options;
        const nextLocation = { ...path, key, state } satisfies Location;
        // prevent death loop navigation
        if (compareLocation(nextLocation, stack.current)) {
          return actions.abortNavigate('Location is the same as the current location');
        }
        if (replace) {
          stack.replace(nextLocation);
        } else {
          stack.push(nextLocation);
        }
        return navigate.success({
          delta: 0,
          action: replace ? Action.Replace : Action.Push,
          location: nextLocation,
        });
      }),
    );
  };

/**
 * Flow creator for handling go (back/forward) actions.
 *
 * Execution flow:
 * 1. Filters for go actions
 * 2. Combines with current state to get history entries
 * 3. Moves the stack index by the specified delta (negative for back, positive for forward)
 * 4. Returns success action with POP action type and the new current location
 */
export const go: HistoryFlowCreator =
  (stack: HistoryStack): HistoryFlow =>
  (action$: Observable<Actions>, state$: Observable<LocationState>) => {
    const { go } = actions;
    return action$.pipe(
      filterAction(go.type),
      withLatestFrom(state$),
      map(([action, state]) => {
        const { delta } = action.payload;
        stack.go(delta, state);
        return go.success({
          delta: 0,
          action: Action.Pop,
          location: stack.current,
        });
      }),
    );
  };

/**
 * Flow creator for handling pop (browser back/forward) actions.
 *
 * Execution flow:
 * 1. Filters for pop actions
 * 2. Uses the location from the action payload or falls back to stack.current
 * 3. Emits a success action with POP action type and the current location
 * 4. Completes the observable immediately (synchronous operation)
 */
export const pop: HistoryFlowCreator =
  (stack: HistoryStack): HistoryFlow =>
  (action$: Observable<Actions>) => {
    const { pop } = actions;
    return action$.pipe(
      filterAction(pop.type),
      concatMap(
        (action) =>
          new Observable<Actions>((subscriber) => {
            const currentLocation = action.payload.update?.location ?? stack.current;
            // todo - we might need to check if the current location is in the history stack
            // for now we will just use the current location
            subscriber.next(
              pop.success({
                delta: 0,
                action: Action.Pop,
                location: currentLocation,
              }),
            );
            subscriber.complete();
          }),
      ),
    );
  };

/**
 * Flow creator for checking navigation blockers before processing actions.
 *
 * Execution flow:
 * 1. Filters for navigation actions (navigate, go, pop, validateLocation)
 * 2. Determines the action type (PUSH/REPLACE for navigate, POP for others)
 * 3. Combines with current state to check for active blockers
 * 4. If no blockers exist, passes the action through immediately
 * 5. If blockers exist:
 *    - Creates a transition object with action, location, and retry callback
 *    - Calls each blocker asynchronously (wrapped in Promise to prevent blocking)
 *    - Blockers can call retry() to allow navigation or prevent it by not calling retry()
 *    - Waits for all blockers to complete before continuing
 * 6. Returns the original action if navigation is allowed, or completes without emitting if blocked
 */
export const checkBlockers: HistoryFlowCreator =
  (stack: HistoryStack): HistoryFlow =>
  (action$: Observable<Actions>, state$: Observable<LocationState>) => {
    const { pop, navigate, go, validateLocation } = actions;
    return action$.pipe(
      filterAction(navigate.type, pop.type, go.type, validateLocation.type),
      map((action) => {
        switch (action.type) {
          case navigate.type:
            return {
              replace: action.payload.options.replace,
              action: action,
            };
          case go.type:
          case pop.type:
          case validateLocation.type:
            return {
              type: 'POP' as Action,
              action: action,
            };
        }
      }),
      withLatestFrom(state$),
      concatMap(([{ action, replace }, state]) => {
        if (!state.blockers.length) {
          return of(action);
        }
        return new Observable<Actions>((subscriber) => {
          const location = stack.current;
          const blockers = state.blockers.map((blocker) =>
            Promise.resolve(
              blocker({
                delta: 0,
                action: replace ? Action.Replace : Action.Push,
                location,
                retry: () => {
                  subscriber.next(action);
                },
              }),
            ),
          );
          Promise.allSettled(blockers).then(() => {
            subscriber.complete();
          });
        });
      }),
    );
  };

/**
 * Flow creator for validating the current location against history state.
 *
 * Execution flow:
 * 1. Filters for validateLocation actions
 * 2. Combines with current state to access history entries
 * 3. Gets the current location from the stack
 * 4. Searches history for an entry matching the current location's key
 * 5. Validates that:
 *    - The location key exists in history (returns failure if not found)
 *    - The location state matches the history entry state (returns failure if mismatch)
 * 6. Returns success action with current location if validation passes, failure otherwise
 */
export const validateCurrentLocation: HistoryFlowCreator =
  (stack: HistoryStack): HistoryFlow =>
  (action$: Observable<Actions>, state$: Observable<LocationState>) => {
    const { validateLocation } = actions;
    return action$.pipe(
      filterAction(validateLocation.type),
      withLatestFrom(state$),
      map(([, state]) => {
        const currentLocation = stack.current;
        const record = state.history.find(({ location }) => location?.key === currentLocation?.key);
        if (!record) {
          return validateLocation.failure(new Error('Stack state not found'));
        }
        if (record?.location?.key !== currentLocation?.key) {
          return validateLocation.failure(new Error('Stack state not found'));
        }
        if (record?.location?.state !== currentLocation?.state) {
          return validateLocation.failure(new Error('Stack state mismatch'));
        }
        return validateLocation.success({
          delta: 0,
          action: Action.Pop,
          location: currentLocation,
        });
      }),
    );
  };

/**
 * Creates a combined history flow from multiple flow creators.
 *
 * Execution flow:
 * 1. Creates a preprocessing step that applies blocker checking (unless skipped)
 * 2. Initializes each flow creator with the stack to create individual flows
 * 3. Merges all flows so they process actions in parallel
 * 4. Returns a combined flow that:
 *    - First applies preprocessing (blocker checking)
 *    - Then processes actions through all merged flows
 *    - Emits results from any flow that matches the action
 *
 * @param flowCreators - Array of flow creators to combine
 * @param options - Optional configuration options
 * @param options.skipBlockCheck - If true, skip blocker checking
 * @returns A combined history flow creator
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
      return merge(
        ...flowCreators
          .map((initializer) => initializer(stack))
          .map((flow) => flow(action$, state$)),
      );
    };

    return (action$: Observable<Actions>, state$: Observable<LocationState>) => {
      return preProcessActions(action$, state$).pipe((source$) => flows(source$, state$));
    };
  };
};

/**
 * Collection of flow creators for history state management.
 */
export const flowCreators = { navigate, go, pop, validateCurrentLocation };
