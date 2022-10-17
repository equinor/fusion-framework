import { from, fromEvent, Observable, of, Subscriber, TeardownLogic, timer } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { Epic, ActionError } from '../..';
import { filterAction } from '../../operators';

import {
    ActionTypes,
    // QueryClientAction,
    FailureAction,
    RequestAction,
    SuccessAction,
    ErrorAction,
} from './actions';

import { QueryFn, RetryOptions, State } from './types';

/**
 * General function for handling an abortable action
 */
const requestProcessor =
    <TType, TArgs>(action$: Observable<ActionTypes<TType, TArgs>>) =>
    (
        action: RequestAction<TArgs>,
        cb?: (subscriber: Subscriber<ActionTypes<TType, TArgs>>) => TeardownLogic
    ): Observable<ActionTypes<TType, TArgs>> => {
        return new Observable((subscriber) => {
            const { controller, transaction } = action.meta;
            /**
             * if the abort signal has been triggered,
             * create a cancel action and complete the observable
             */
            if (controller.signal.aborted) {
                subscriber.next({
                    type: 'cancel',
                    payload: `request [${transaction}] was aborted!`,
                    meta: { request: action },
                });
                return subscriber.complete();
            }

            /** subscribe to cancel request on the action stream */
            subscriber.add(
                action$.pipe(filterAction('cancel')).subscribe(() => {
                    if (!controller.signal.aborted) {
                        controller.abort();
                    }
                    subscriber.complete();
                })
            );

            /** subscribe to abort from the controller */
            subscriber.add(
                fromEvent(controller.signal, 'abort').subscribe(() => {
                    subscriber.next({
                        type: 'cancel',
                        payload: `request [${transaction}] was aborted!`,
                        meta: { request: action },
                    });
                    subscriber.complete();
                })
            );

            /** call callback and add to teardown */
            if (cb) {
                return cb(subscriber);
            }
        });
    };

export const handleFailures = <TType, TArgs>(
    config?: Partial<RetryOptions>
): Epic<ActionTypes<TType, TArgs>, State> => {
    config = Object.assign({}, { count: 0, delay: 0 }, config);
    return (action$, state$) => {
        const process = requestProcessor(action$);
        return action$.pipe(
            filterAction('failure'),
            withLatestFrom(state$),
            switchMap(([action, state]) => {
                const { retryCount = 0 } = state;
                const request = { ...action.payload.action } as RequestAction<TArgs>;
                const retry = Object.assign({}, config, request.meta.retry) as RetryOptions;
                return process(request, (subscriber) => {
                    if (retryCount >= retry.count) {
                        const message = retry.count
                            ? 'maximum retries executed!'
                            : action.payload.message;
                        subscriber.next({
                            type: 'error',
                            payload: new ActionError(action, action.payload.cause, message),
                            meta: { request },
                        });
                        return subscriber.complete();
                    }
                    const delay$ =
                        typeof retry.delay === 'function'
                            ? from(retry.delay(action.payload.cause))
                            : (timer(retry.delay) as unknown as Observable<void>);

                    return delay$
                        .pipe(
                            map(() => request),
                            catchError(
                                (err): Observable<ErrorAction<TArgs>> =>
                                    of({
                                        type: 'error',
                                        payload: new ActionError(
                                            request,
                                            err,
                                            'failed to resolve delay'
                                        ),
                                        meta: { request },
                                    })
                            )
                        )
                        .subscribe(subscriber);
                });
            })
        );
    };
};

export const handleRequests =
    <TType, TArgs>(fetch: QueryFn<TType, TArgs>): Epic<ActionTypes<TType, TArgs>, State> =>
    (action$) => {
        const process = requestProcessor(action$);
        return action$.pipe(
            filterAction('request'),
            switchMap((action) => {
                return process(action, (subscriber) => {
                    from(fetch(action.payload, action.meta.controller.signal))
                        .pipe(
                            map(
                                (result): SuccessAction<TArgs, TType> => ({
                                    type: 'success',
                                    payload: result,
                                    meta: { request: action },
                                })
                            ),
                            catchError(
                                (err): Observable<FailureAction<TArgs>> =>
                                    of({
                                        type: 'failure',
                                        payload: new ActionError(
                                            action,
                                            err,
                                            'failed to execute request'
                                        ),
                                        meta: { request: action },
                                    })
                            )
                        )
                        .subscribe(subscriber);
                });
            })
        );
    };
