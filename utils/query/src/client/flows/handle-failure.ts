import {
    withLatestFrom,
    switchMap,
    EMPTY,
    from,
    timer,
    Observable,
    map,
    catchError,
    filter,
} from 'rxjs';

import { Flow } from '@equinor/fusion-observable/src';

import { actions, Actions } from '../actions';
import { RetryOptions, State } from '../types';
import processRequest from './process-request';

export const handleFailures = (config?: Partial<RetryOptions>): Flow<Actions, State> => {
    config = Object.assign({}, { count: 0, delay: 0 }, config);
    return (action$, state$) => {
        return action$.pipe(
            processRequest((request) => {
                return action$.pipe(
                    filter(actions.failure.match),
                    filter((action) => action.meta.request === request),
                    withLatestFrom(state$),
                    switchMap(([action, state]) => {
                        const { transaction } = request.meta;
                        const entry = state[transaction];
                        if (!entry) {
                            return EMPTY;
                        }
                        const retryCount = entry.retry?.length ?? 0;
                        const retryOptions = Object.assign(
                            {},
                            config,
                            request.meta.retry
                        ) as RetryOptions;

                        if (retryCount >= retryOptions.count) {
                            const message = retryOptions.count
                                ? 'maximum retries executed!'
                                : action.payload.message;
                            throw Error(message, { cause: action.payload });
                        }
                        const delay$ =
                            typeof retryOptions.delay === 'function'
                                ? from(retryOptions.delay(action.payload.cause)).pipe(
                                      catchError((cause) => {
                                          throw Error('failed to resolve delay', { cause });
                                      })
                                  )
                                : (timer(retryOptions.delay) as unknown as Observable<void>);

                        return delay$.pipe(map(() => actions.retry(request)));
                    })
                );
            })
        );
    };
};

export default handleFailures;
