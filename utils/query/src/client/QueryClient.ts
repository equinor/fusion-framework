import { firstValueFrom, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import * as uuid from 'uuid';

import { ActionType, ExtractAction, FlowSubject } from '@equinor/fusion-observable';
import { filterAction } from '@equinor/fusion-observable/operators';

import { ActionTypes, RequestAction } from './actions';
import { handleRequests, handleFailures } from './epics';
import { filterQueryTaskComplete } from './operators';
import { QueryClientError } from './QueryClientError';
import { createReducer } from './reducer';

import { State, RetryOptions, QueryFn, QueryTaskCompleted, QueryTaskValue } from './types';

/**
 * - __controller__: [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) [optional]
 * - __retry__: retry config {@link RetryOpt}
 */
export type QueryClientOptions<TType = unknown, TArgs = unknown> = {
    controller: AbortController;
    retry: Partial<RetryOptions>;
    /** reference to a query  */
    ref?: string;
    task?: Subject<QueryTaskValue<TType, TArgs>>;
};

export type QueryClientCtorOptions = {
    retry?: Partial<RetryOptions>;
};

export class QueryClient<TType, TArgs> extends Observable<State<TType, TArgs>> {
    /** internal state */
    #state: FlowSubject<State<TType, TArgs>, ActionTypes<TType, TArgs>>;

    #subscription: Subscription;

    /** get stream of dispatched actions */
    public get action$(): Observable<ActionTypes<TType, TArgs>> {
        return this.#state.action$;
    }

    public get closed() {
        return this.#state.closed;
    }

    public get success$(): Observable<TType> {
        return this.action$.pipe(
            filterAction('success'),
            map(({ payload }) => payload)
        );
    }

    public get error$(): Observable<QueryClientError> {
        return this.action$.pipe(
            filterAction('error'),
            map(
                ({ payload }) => new QueryClientError('error', 'failed to execute request', payload)
            )
        );
    }

    constructor(queryFn: QueryFn<TType, TArgs>, options?: QueryClientCtorOptions) {
        super((subscriber) => {
            return this.#state.subscribe(subscriber);
        });

        this.#state = new FlowSubject(createReducer<TType, TArgs>(), {});

        this.#subscription = new Subscription(() => this.#state.complete());

        this.#subscription.add(this.#state.addEpic(handleRequests(queryFn)));

        const retry = Object.assign({ count: 0, delay: 0 }, options?.retry);
        this.#subscription.add(this.#state.addEpic(handleFailures(retry)));
    }

    /**
     * Execute query, will update state on success
     * @param args call arguments for query function
     * @param opt query options {@link QueryClientOptions}
     * @returns id of the request
     */
    public next(
        args?: TArgs,
        opt?: Partial<QueryClientOptions<TType, TArgs>>
    ): RequestAction<TArgs, TType>['meta'] {
        return this._next(args, opt).meta;
    }

    /**
     * Execute query, will update state on success
     * @param args call arguments for query function
     * @param opt query options {@link QueryClientOptions}
     * @returns id of the request
     */
    public async nextAsync(
        args?: TArgs,
        opt?: Partial<QueryClientOptions<TType, TArgs>>
    ): Promise<QueryTaskCompleted<TType, TArgs>> {
        return firstValueFrom(this.next(args, opt).task.pipe(filterQueryTaskComplete()));
    }

    public getTaskByTransaction(
        transaction: string
    ): Subject<QueryTaskValue<TType, TArgs>> | undefined {
        const entry = this.#state.value[transaction];
        return entry && entry.task;
    }

    public getTaskByRef(ref: string): Subject<QueryTaskValue<TType, TArgs>> | undefined {
        const entry = Object.values(this.#state.value).find((x) => x.ref === ref);
        return entry && entry.task;
    }

    /**
     * Cancel current request
     * @param reason message of why request was canceled
     */
    public cancel(transaction?: string, reason?: string): void {
        if (transaction && this.#state.value[transaction]) {
            reason ??= `[${transaction}]: transaction canceled`;
            this.#state.next({
                type: 'cancel',
                payload: { transaction, reason },
            });
        } else {
            for (const key of Object.keys(this.#state.value)) {
                this.cancel(key, `[${transaction}]: all transactions canceled`);
            }
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
        return this.#state.addEffect(type, (action) => {
            cb(action, this);
        });
    }

    /** complete and close query */
    public complete() {
        this.#subscription.unsubscribe();
    }

    public asObservable() {
        return this.#state.asObservable();
    }

    protected _next(
        args?: TArgs,
        opt?: Partial<QueryClientOptions<TType, TArgs>>
    ): RequestAction<TArgs, TType> {
        const meta = Object.assign(
            {
                transaction: uuid.v4(),
                controller: new AbortController(),
                task: new ReplaySubject<QueryTaskValue>(),
            },
            opt ?? {}
        );
        const action: RequestAction<TArgs, TType> = {
            type: 'request',
            payload: args as TArgs,
            meta,
        };

        this.#state.next(action);

        return action;
    }
}

export default QueryClient;
