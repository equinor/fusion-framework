import type { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import type { HistoryFlowCreator } from './navigate';
import { actions, type Actions } from './actions';
import { filterAction } from '@equinor/fusion-observable/operators';
import { Action, type LocationState, type HistoryStack } from '../types';

/** Flow creator that validates the current stack location against reducer state. */
export const validateCurrentLocation: HistoryFlowCreator =
  (stack: HistoryStack) => (action$: Observable<Actions>, state$: Observable<LocationState>) =>
    // Confirm the browser stack's current key still matches reducer state.
    action$.pipe(
      filterAction(actions.validateLocation.type),
      withLatestFrom(state$),
      map(([, state]) => {
        const currentLocation = stack.current;
        // Find the reducer entry matching the stack key before comparing location state.
        const record = state.history.find(({ location }) => location?.key === currentLocation?.key);
        // Reject validation when the browser stack key is absent from reducer state.
        if (!record) {
          return actions.validateLocation.failure(new Error('Stack state not found'));
        }
        // Reject validation when the stack and reducer carry different location state.
        if (record.location?.state !== currentLocation?.state) {
          return actions.validateLocation.failure(new Error('Stack state mismatch'));
        }
        return actions.validateLocation.success({
          delta: 0,
          action: Action.Pop,
          location: currentLocation,
        });
      }),
    );
