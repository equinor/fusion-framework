import { Observable, of } from 'rxjs';
import { concatMap, map, withLatestFrom } from 'rxjs/operators';
import type { HistoryFlowCreator } from './navigate';
import { actions, type Actions } from './actions';
import { filterAction } from '@equinor/fusion-observable/operators';
import { Action, type HistoryStack, type LocationState } from '../types';

/** Flow creator that gates navigation actions through registered blockers. */
export const checkBlockers: HistoryFlowCreator =
  (stack: HistoryStack) => (action$: Observable<Actions>, state$: Observable<LocationState>) =>
    // Normalize each navigation-related action into a common shape before gating on blockers.
    action$.pipe(
      filterAction(
        actions.navigate.type,
        actions.pop.type,
        actions.go.type,
        actions.validateLocation.type,
      ),
      map((action) => {
        // Only `navigate` carries a replace flag; the rest are treated as POP transitions.
        switch (action.type) {
          case actions.navigate.type:
            return { replace: action.payload.options.replace, action };
          case actions.go.type:
          case actions.pop.type:
          case actions.validateLocation.type:
            return { type: 'POP' as Action, action };
        }
      }),
      withLatestFrom(state$),
      concatMap(([{ action, replace }, state]) => {
        // Allow actions through immediately when no blocker can veto the transition.
        if (!state.blockers.length) {
          return of(action);
        }
        return new Observable<Actions>((subscriber) => {
          const location = stack.current;
          // Invoke all blockers and complete once every asynchronous decision settles.
          const blockers = state.blockers.map((blocker) =>
            Promise.resolve(
              blocker({
                delta: 0,
                action: replace ? Action.Replace : Action.Push,
                location,
                retry: () => subscriber.next(action),
              }),
            ),
          );
          Promise.allSettled(blockers).then(() => subscriber.complete());
        });
      }),
    );
