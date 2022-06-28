import { from, fromEvent, Observable, of, Subscriber, TeardownLogic, timer } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { Epic, ActionError } from '..';
import { filterAction } from '../operators';

import {
    Actions,
    ActionType,
    ErrorAction,
    FailureAction,
    RequestAction,
    SuccessAction,
} from './actions';

import { QueryFn, RetryOpt, QueryState } from './types';

/**
 * General function for handling an abortable action
 */
const requestProcessor =
    <TType, TArgs>(action$: Observable<Actions<TType, TArgs>>) =>
    (
        action: RequestAction<TArgs>,
        cb?: (subscriber: Subscriber<Actions<TType, TArgs>>) => TeardownLogic
    ): Observable<Actions<TType, TArgs>> => {
        return new Observable((subscriber) => {
            const { controller } = action.meta;
            /**
             * if the abort signal has been triggered,
             * create a cancel action and complete the observable
             */
            if (controller.signal.aborted) {
                subscriber.next({
                    type: ActionType.CANCEL,
                    payload: `request [${action.transaction}] was aborted!`,
                    meta: { request: action },
                });
                return subscriber.complete();
            }

            /** subscribe to cancel request on the action stream */
            subscriber.add(
                action$.pipe(filterAction(ActionType.CANCEL)).subscribe(() => {
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
                        type: ActionType.CANCEL,
                        payload: `request [${action.transaction}] was aborted!`,
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
    config?: Partial<RetryOpt>
): Epic<Actions<TType, TArgs>, QueryState> => {
    config = Object.assign({}, { count: 0, delay: 0 }, config);
    return (action$, state$) => {
        const process = requestProcessor(action$);
        return action$.pipe(
            filterAction(ActionType.FAILURE),
            withLatestFrom(state$),
            switchMap(([action, state]) => {
                const { retryCount = 0 } = state;
                const request = { ...action.payload.action } as RequestAction<TArgs>;
                const retry = Object.assign({}, config, request.meta.retry) as RetryOpt;
                return process(request, (subscriber) => {
                    if (retryCount >= retry.count) {
                        const message = retry.count
                            ? 'maximum retries executed!'
                            : action.payload.message;
                        subscriber.next({
                            type: ActionType.ERROR,
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
                                        type: ActionType.ERROR,
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
    <TType, TArgs>(fetch: QueryFn<TType, TArgs>): Epic<Actions<TType, TArgs>, QueryState> =>
    (action$) => {
        const process = requestProcessor(action$);
        return action$.pipe(
            filterAction(ActionType.REQUEST),
            switchMap((action) => {
                return process(action, (subscriber) => {
                    from(fetch(action.payload, action.meta.controller.signal))
                        .pipe(
                            map(
                                (result): SuccessAction<TArgs, TType> => ({
                                    type: ActionType.SUCCESS,
                                    payload: result,
                                    meta: { request: action },
                                })
                            ),
                            catchError(
                                (err): Observable<FailureAction<TArgs>> =>
                                    of({
                                        type: ActionType.FAILURE,
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
