import type { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import type { HistoryFlowCreator } from './navigate';
import { actions, type Actions } from './actions';
import { filterAction } from '@equinor/fusion-observable/operators';
import type { LocationState } from '../types';
import { Action } from '../types';

/** Flow creator for handling go back and forward actions. */
export const go: HistoryFlowCreator =
  (stack) => (action$: Observable<Actions>, state$: Observable<LocationState>) =>
    // Move the stack by the requested delta and emit the resulting location.
    action$.pipe(
      filterAction(actions.go.type),
      withLatestFrom(state$),
      map(([action, state]) => {
        stack.go(action.payload.delta, state);
        return actions.go.success({ delta: 0, action: Action.Pop, location: stack.current });
      }),
    );
