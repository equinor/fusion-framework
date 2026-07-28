import type { Flow } from '@equinor/fusion-observable';
import { filter, map } from 'rxjs';

import { actions, type Actions } from './actions';
import type { QueryClientState } from './types';

/**
 * Handles incoming request actions by transforming them into execute actions.
 *
 * @param action$ - The stream of actions being dispatched in the system.
 * @returns An Observable that emits execute actions for each request action.
 */
export const handleRequests: Flow<Actions, QueryClientState> = (action$) =>
  action$
    // convert each incoming request action into an execute action for its transaction
    .pipe(
      filter(actions.request.match),
      map((action) => actions.execute(action.meta.transaction)),
    );
