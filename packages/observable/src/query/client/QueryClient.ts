import { asyncScheduler, firstValueFrom, Observable, Subscription } from 'rxjs';
import { map, observeOn } from 'rxjs/operators';

import { v4 as uuid } from 'uuid';

import { ActionType, ExtractAction, ReactiveObservable } from '../..';
import { filterAction } from '../../operators';

import { ActionTypes, RequestAction } from './actions';
import { handleRequests, handleFailures } from './epics';
import { QueryClientError } from './QueryClientError';
import { createReducer } from './reducer';

import { State, RetryOptions, QueryFn } from './types';

// import { RetryOpt, QueryFn, QueryState, QueryStatus } from './types';
/**
 * - __controller__: [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) [optional]
 * - __retry__: retry config {@link RetryOpt}
 */
export type QueryClientOptions = {
    controller: AbortController;
    retry: Partial<RetryOptions>;
    /** reference to a query  */
    ref?: string;
};

export type QueryClientCtorOptions = {
    retry?: Partial<RetryOptions>;
};

export class QueryClient<TType, TArgs> extends Observable<State> {
    /** internal state */
    #state$: ReactiveObservable<State, ActionTypes<TType, TArgs>>;

    #subscription: Subscription;

    public get value(): State {
        return this.#state$.value;
    }

    /** get stream of dispatched actions */
    public get action$(): Observable<ActionTypes<TType, TArgs>> {
        return this.#state$.action$;
    }

    public get closed() {
        return this.#state$.closed;
    }

    public get status() {
        return this.value.status;
    }

    public get error() {
        return this.value.error;
    }

    constructor(queryFn: QueryFn<TType, TArgs>, options?: QueryClientCtorOptions) {
        super((subscriber) => {
            return this.#state$.subscribe(subscriber);
        });

        this.#state$ = new ReactiveObservable(createReducer(), { status: 'idle' });

        this.#subscription = new Subscription(() => this.#state$.complete());

        this.#subscription.add(this.#state$.addEpic(handleRequests(queryFn)));

        const retry = Object.assign({ count: 0, delay: 0 }, options?.retry);
        this.#subscription.add(this.#state$.addEpic(handleFailures(retry)));
    }

    /**
     * Execute query, will update state on success
     * @param args call arguments for query function
     * @param opt query options {@link QueryClientOptions}
     * @returns id of the request
     */
    public next(args?: TArgs, opt?: Partial<QueryClientOptions>): string {
        const action = this._next(args, opt);
        return action.meta.transaction;
    }

    /**
     * Execute query, will update state on success
     * @param args call arguments for query function
     * @param opt query options {@link QueryClientOptions}
     * @returns id of the request
     */
    public async nextAsync(
        args?: TArgs,
        opt?: Partial<QueryClientOptions>
    ): Promise<TType | Error> {
        this._next(args, opt);
        const complete$ = this.#state$.action$.pipe(
            filterAction('success', 'error', 'cancel'),
            map((action): TType | QueryClientError => {
                const { payload, type } = action;
                switch (type) {
                    case 'error':
                        throw new QueryClientError(
                            'error',
                            'failed to execute request',
                            payload as Error
                        );
                    case 'cancel':
                        throw new QueryClientError(
                            'abort',
                            'request was canceled',
                            new Error(String(payload))
                        );
                }
                return payload as TType;
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
        if (this.value.status !== 'canceled') {
            this.#state$.next({
                type: 'cancel',
                payload: reason || `request [${this.value.transaction}] was canceled!`,
                meta: { request: undefined },
            });
        }
    }

    /**
     * Process action
     */
    public on<TAction extends ActionType<ActionTypes>>(
        type: TAction,
        cb: (
            action: ExtractAction<ActionTypes<TType, TArgs>, TAction>,
            subject: QueryClient<TType, TArgs>
        ) => void
    ) {
        return this.#state$.addEffect(type, (action) => {
            cb(action, this);
        });
    }

    /** complete and close query */
    public complete() {
        this.#subscription.unsubscribe();
    }

    public asObservable() {
        return this.#state$.asObservable();
    }

    protected _next(args?: TArgs, opt?: Partial<QueryClientOptions>): RequestAction<TArgs> {
        const { controller = new AbortController() } = opt ?? {};
        const meta = { ...opt, controller, transaction: uuid() };
        const action: RequestAction<TArgs> = {
            type: 'request',
            payload: args as TArgs,
            meta,
        };

        this.#state$.next(action);

        return action;
    }
}

export default QueryClient;
