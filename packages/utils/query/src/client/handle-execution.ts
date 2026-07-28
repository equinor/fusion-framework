import type { Flow } from '@equinor/fusion-observable';
import { catchError, filter, from, map, mergeMap, of, takeUntil, tap, withLatestFrom } from 'rxjs';

import { actions, type Actions } from './actions';
import type { QueryClientState, QueryFn } from './types';

/**
 * Handles the execution of a query.
 *
 * @param fetch - The function used to execute the query.
 * @returns A flow that handles the execution of the query.
 */
export const handleExecution =
  <TType, TArgs>(fetch: QueryFn<TType, TArgs>): Flow<Actions, QueryClientState<TArgs>> =>
  (action$, state$) =>
    // execute the query for each request and translate the outcome back into actions
    action$.pipe(
      filter(actions.execute.match),
      withLatestFrom(state$),
      mergeMap(([action, state]) => {
        const transaction = action.payload;
        const request = state[transaction];

        // Create an AbortController instance to manage cancellation.
        const controller = new AbortController();

        // Listen for cancel actions specifically targeting this transaction.
        const cancel$ = action$.pipe(
          filter(actions.cancel.match),
          filter((next) => next.payload.transaction === transaction),
          tap(() => {
            // If the request hasn't been aborted yet, abort it.
            if (!controller.signal.aborted) {
              controller.abort();
            }
          }),
        );

        try {
          // map the fetch outcome to a success/failure action, cancelling early if aborted
          return from(fetch(request.args, controller.signal)).pipe(
            map((value) =>
              actions.execute.success({
                ...request,
                status: 'complete',
                completed: Date.now(),
                value,
              }),
            ),
            catchError((err) => of(actions.execute.failure(err, transaction))),
            takeUntil(cancel$), // Complete the observable chain if a cancel action is received.
          );
        } catch (err) {
          // Normally errors thrown during the execution of the fetch function are caught by the `catchError` operator.
          // However, if the fetch function itself throws an error, it will be caught here.
          // This can happen if the fetch function is not a function or if it throws synchronously.
          return of(actions.execute.failure(err as Error, transaction));
        }
      }),
    );
