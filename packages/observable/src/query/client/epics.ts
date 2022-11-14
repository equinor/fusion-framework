import { EMPTY, from, fromEvent, Observable, of, Subscriber, TeardownLogic, timer } from 'rxjs';
import { catchError, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';

import { Epic, ActionError } from '../..';
import { filterAction } from '../../operators';

import {
    ActionTypes,
    FailureAction,
    RequestAction,
    SuccessAction,
    ErrorAction,
    RetryAction,
} from './actions';

import { QueryFn, RetryOptions, State } from './types';

/**
 * General function for handling an abortable action
 */
const requestProcessor =
    <TType, TArgs>(action$: Observable<ActionTypes<TType, TArgs>>) =>
    (
        request: RequestAction<TArgs, TType>,
        cb?: (subscriber: Subscriber<ActionTypes<TType, TArgs>>) => TeardownLogic
    ): Observable<ActionTypes<TType, TArgs>> => {
        return new Observable((subscriber) => {
            const {
                meta: { controller, transaction },
            } = request;
            /**
             * if the abort signal has been triggered,
             * create a cancel action and complete the observable
            //  */
            if (controller.signal.aborted) {
                subscriber.next({
                    type: 'cancel',
                    payload: { transaction, reason: `request [${transaction}] was aborted!` },
                });
                return subscriber.complete();
            }

            /** subscribe to cancel request on the action stream */
            subscriber.add(
                action$.pipe(filterAction('cancel')).subscribe((action) => {
                    /** if no transaction specified or transaction match current */
                    if (action.payload.transaction === transaction) {
                        if (!controller.signal.aborted) {
                            controller.abort();
                        }
                        subscriber.complete();
                    }
                })
            );

            /** subscribe to abort from the controller */
            subscriber.add(
                fromEvent(controller.signal, 'abort').subscribe(() => {
                    subscriber.next({
                        type: 'cancel',
                        payload: {
                            transaction,
                            reason: `request [${transaction}] was aborted!`,
                        },
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
): Epic<ActionTypes<TType, TArgs>, State<TType, TArgs>> => {
    config = Object.assign({}, { count: 0, delay: 0 }, config);
    return (action$, state$) => {
        const process = requestProcessor(action$);
        return action$.pipe(
            filterAction('failure'),
            withLatestFrom(state$),
            switchMap(([action, state]) => {
                const { request } = action.meta;
                const { transaction } = request.meta;
                const entry = state[transaction];
                if (!entry) {
                    return EMPTY;
                }
                const retryCount = entry.retry?.length ?? 0;

                const retryAction: RetryAction<TArgs, TType> = {
                    type: 'retry',
                    payload: action.meta.request,
                };
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
                            map(() => retryAction),
                            catchError((err) =>
                                of<ErrorAction<TArgs, TType>>({
                                    type: 'error',
                                    payload: new ActionError(
                                        retryAction,
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
    <TType, TArgs>(
        fetch: QueryFn<TType, TArgs>
    ): Epic<ActionTypes<TType, TArgs>, State<TType, TArgs>> =>
    (action$) => {
        const process = requestProcessor(action$);
        return action$.pipe(
            filterAction('request', 'retry'),
            mergeMap((action) => {
                const request = action.type === 'request' ? action : action.payload;
                return process(request, (subscriber) => {
                    from(fetch(request.payload, request.meta.controller.signal))
                        .pipe(
                            map(
                                (result): SuccessAction<TArgs, TType> => ({
                                    type: 'success',
                                    payload: result,
                                    meta: { request },
                                })
                            ),
                            catchError(
                                (err): Observable<FailureAction<TArgs, TType>> =>
                                    of({
                                        type: 'failure',
                                        payload: new ActionError(
                                            action,
                                            err,
                                            'failed to execute request'
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
