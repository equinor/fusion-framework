import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import type { HistoryFlowCreator } from './navigate.js';
import { actions, type Actions } from './actions.js';
import { filterAction } from '@equinor/fusion-observable/operators';
import type { HistoryStack } from '../types.js';
import { Action } from '../types.js';

/** Flow creator for handling POP actions from browser navigation. */
export const pop: HistoryFlowCreator = (stack: HistoryStack) => (action$: Observable<Actions>) =>
  // Translate a browser-driven POP into a success action carrying its location.
  action$.pipe(
    filterAction(actions.pop.type),
    concatMap(
      (action) =>
        new Observable<Actions>((subscriber) => {
          const currentLocation = action.payload.update?.location ?? stack.current;
          subscriber.next(
            actions.pop.success({ delta: 0, action: Action.Pop, location: currentLocation }),
          );
          subscriber.complete();
        }),
    ),
  );
