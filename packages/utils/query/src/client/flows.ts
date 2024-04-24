import { type Flow } from '@equinor/fusion-observable';
import { actions, type Actions } from './actions';
import type { QueryClientState, QueryFn, RetryOptions } from './types';
import {
    filter,
    mergeMap,
    from,
    map,
    catchError,
    of,
    takeUntil,
    withLatestFrom,
    timer,
    Observable,
    tap,
} from 'rxjs';
import { QueryClientError } from './QueryClientError';

/**
 * Handles incoming request actions by transforming them into execute actions.
 *
 * @param action$ - The stream of actions being dispatched in the system.
 * @returns An Observable that emits execute actions for each request action.
 */
export const handleRequests: Flow<Actions, QueryClientState> = (action$) =>
    action$.pipe(
        filter(actions.request.match),
        map((action) => actions.execute(action.meta.transaction)),
    );

/**
 * Handles the execution of a query.
 *
 * @param fetch - The function used to execute the query.
 * @returns A flow that handles the execution of the query.
 */
export const handleExecution =
    <TType, TArgs>(fetch: QueryFn<TType, TArgs>): Flow<Actions, QueryClientState<TArgs>> =>
    (action$, state$) =>
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

                // Execute the fetch operation, passing the AbortSignal to allow for cancellation.
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
            }),
        );

/**
 * Handles execution failure by scheduling retries according to the provided retry options.
 * If the maximum number of retries is exceeded or no retry options are provided, it emits an error action.
 * Otherwise, it schedules a retry after a delay determined by the retry options.
 *
 * @param config - Optional configuration for retry behavior, including the maximum number of retries and delay between retries.
 */
export const handleFailure = (config?: Partial<RetryOptions>): Flow<Actions, QueryClientState> => {
    return (action$, state$) => {
        return action$.pipe(
            // Filter for actions that indicate an execution failure.
            filter(actions.execute.failure.match),
            // Combine each failure action with the latest state.
            withLatestFrom(state$),
            // Handle the retry logic for each failure.
            mergeMap(([action, state]) => {
                // Extract the transaction identifier from the action metadata.
                const { transaction } = action.meta;
                // Retrieve the corresponding request from the state.
                const request = state[transaction];

                // If the request no longer exists in the state, it cannot be retried.
                if (!request) {
                    return of(
                        actions.error(
                            transaction,
                            new QueryClientError('error', {
                                message:
                                    'request not found, cannot retry request, most likely removed while scheduled for retry!',
                            }),
                        ),
                    );
                }

                // Count the number of execution attempts made for this request.
                const executions = request.execution.length;
                // Merge the provided configuration with the request-specific retry options.
                const retryOptions = Object.assign(
                    {},
                    config,
                    request.options?.retry,
                ) as RetryOptions;

                // Identify the cause of the failure, either the last known error or a generic message.
                const cause =
                    request.errors?.slice(-1)[0] ??
                    new QueryClientError('error', {
                        message: 'no errors registered for request!',
                        request,
                    });

                // If the maximum number of retries has been reached, report an error.
                if (executions > retryOptions.count) {
                    const error =
                        // if retry is disabled return the last error, else return all registered errors
                        retryOptions.count === 0
                            ? cause
                            : new QueryClientError('error', {
                                  message: 'maximum retries executed!',
                                  cause: request.errors,
                                  request,
                              });
                    return of(actions.error(transaction, error));
                }

                // Create an Observable that emits after the specified delay for the retry.
                const delay$ =
                    typeof retryOptions.delay === 'function'
                        ? from(retryOptions.delay(cause)).pipe(
                              // Catch errors that occur within the delay calculation.
                              catchError((cause) =>
                                  of(
                                      actions.error(
                                          transaction,
                                          new QueryClientError('error', {
                                              message: 'retry delay callback failed!',
                                              cause: [...(request.errors ?? []), cause],
                                              request,
                                          }),
                                      ),
                                  ),
                              ),
                          )
                        : (timer(retryOptions.delay) as unknown as Observable<void>);

                // After the delay, check if the request is still present and initiate a retry.
                return delay$.pipe(
                    withLatestFrom(state$),
                    // Ensure the request has not been removed from the state during the delay.
                    filter(([_, state]) => !!state[transaction]),
                    // If the request has been removed, throw an error.
                    tap(([, state]) => {
                        if (!state[transaction]) {
                            throw new QueryClientError('error', {
                                message:
                                    'request not found, most likely removed while scheduled for retry',
                                cause: request.errors,
                                request,
                            });
                        }
                    }),
                    // Emit an action to re-execute the request.
                    map(() => actions.execute(transaction)),
                );
            }),
        );
    };
};
