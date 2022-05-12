import { asyncScheduler, firstValueFrom, Observable, Subscription } from 'rxjs';
import { map, observeOn } from 'rxjs/operators';

import { v4 as uuid } from 'uuid';

import { ExtractAction, ReactiveObservable } from '..';
import { filterAction } from '../operators';

import { Actions, ActionType, RequestAction } from './actions';
import { handleRequests, handleFailures } from './epics';
import { QueryError } from './errors';
import { createReducer } from './reducer';

import { RetryOpt, QueryFn, QueryState, QueryStatus } from './types';
/**
 * - __controller__: [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) [optional]
 * - __retry__: retry config {@link RetryOpt}
 */
type QueryOptions = {
    controller: AbortController;
    retry: Partial<RetryOpt>;
};

export class Query<TType, TArgs> extends Observable<QueryState> {
    /** internal state */
    private __state$: ReactiveObservable<QueryState, Actions<TType, TArgs>>;

    private __subscription: Subscription;

    public get value(): QueryState {
        return this.__state$.value;
    }

    /** get stream of dispatched actions */
    public get action$(): Observable<Actions<TType, TArgs>> {
        return this.__state$.action$;
    }

    public get closed() {
        return this.__state$.closed;
    }

    constructor(queryFn: QueryFn<TType, TArgs>, config?: { retry?: Partial<RetryOpt> }) {
        super((subscriber) => {
            return this.__state$.subscribe(subscriber);
        });

        this.__state$ = new ReactiveObservable(createReducer(), { status: QueryStatus.IDLE });

        this.__subscription = new Subscription(() => this.__state$.complete());

        this.__subscription.add(this.__state$.addEpic(handleRequests(queryFn)));

        const retry = Object.assign({ count: 0, delay: 0 }, config?.retry);
        this.__subscription.add(this.__state$.addEpic(handleFailures(retry)));
    }

    /**
     * Execute query, will update state on success
     * @param args call arguments for query function
     * @param opt query options {@link QueryOptions}
     * @returns id of the request
     */
    public next(args?: TArgs, opt?: Partial<QueryOptions>): string {
        return this._next(args, opt).transaction;
    }

    /**
     * Execute query, will update state on success
     * @param args call arguments for query function
     * @param opt query options {@link QueryOptions}
     * @returns id of the request
     */
    public async nextAsync(args?: TArgs, opt?: Partial<QueryOptions>): Promise<TType | Error> {
        this._next(args, opt);
        const complete$ = this.__state$.action$.pipe(
            filterAction(ActionType.SUCCESS, ActionType.ERROR, ActionType.CANCEL),
            map((action): TType | QueryError => {
                const { payload, type } = action;
                switch (type) {
                    case ActionType.ERROR:
                        throw new QueryError(
                            QueryError.TYPE.ERROR,
                            'failed to execute request',
                            payload
                        );
                    case ActionType.CANCEL:
                        throw new QueryError(
                            QueryError.TYPE.ABORT,
                            'request was canceled',
                            new Error(payload)
                        );
                }
                return payload;
            }),
            observeOn(asyncScheduler)
        );

        return firstValueFrom(complete$);
    }

    /**
     * Cancel current request
     * @param reason message of why request was canceled
     */
    public cancel(reason?: string): void {
        if (this.value.status !== QueryStatus.CANCELED) {
            this.__state$.next({
                type: ActionType.CANCEL,
                payload: reason || `request [${this.value.transaction}] was canceled!`,
                meta: { request: undefined },
            });
        }
    }

    /**
     * Process action
     */
    public on<TAction extends ActionType>(
        type: TAction,
        cb: (
            action: ExtractAction<Actions<TType, TArgs>, TAction>,
            subject: Query<TType, TArgs>
        ) => void
    ) {
        return this.__state$.addEffect(type, (action) => {
            cb(action, this);
        });
    }

    /** complete and close query */
    public complete() {
        this.__subscription.unsubscribe();
    }

    public asObservable() {
        return this.__state$.asObservable();
    }

    protected _next(args?: TArgs, opt?: Partial<QueryOptions>): RequestAction<TArgs> {
        const { controller = new AbortController() } = opt ?? {};
        const meta = { ...opt, controller };
        const action: RequestAction<TArgs> = {
            transaction: uuid(),
            type: ActionType.REQUEST,
            payload: args as TArgs,
            meta,
        };

        this.__state$.next(action);

        return action;
    }
}

export default Query;
