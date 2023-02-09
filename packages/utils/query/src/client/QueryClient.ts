import { firstValueFrom, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';

import { FlowSubject } from '@equinor/fusion-observable';
import { filterAction } from '@equinor/fusion-observable/operators';

import actions, { ActionBuilder, ActionMap, Actions } from './actions';

import { handleRetry, handleFailures, handleRequests } from './flows';
import { filterQueryTaskComplete } from './operators';
import { QueryClientError } from './QueryClientError';
import createReducer from './reducer';

import { State, RetryOptions, QueryFn, QueryTaskCompleted, QueryTaskValue } from './types';

/**
 * - __controller__: [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) [optional]
 * - __retry__: retry config {@link RetryOpt}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryClientOptions<TType = any, TArgs = any> = {
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
    #state: FlowSubject<State, Actions>;

    #subscription: Subscription;

    public get closed() {
        return this.#state.closed;
    }

    public get state$(): Observable<State<TType, TArgs>> {
        return this.#state as Observable<State<TType, TArgs>>;
    }

    /** get stream of dispatched actions */
    public get action$(): Observable<Actions<TType, TArgs>> {
        return this.#state.action$ as Observable<Actions<TType, TArgs>>;
    }

    public get success$(): Observable<TType> {
        return this.action$.pipe(
            filter(actions.success.match),
            map(({ payload }) => payload as TType)
        );
    }

    public get error$(): Observable<QueryClientError> {
        return this.action$.pipe(
            filterAction('client/error'),
            withLatestFrom(this.#state),
            map(([action, state]) => {
                const { payload, meta } = action;
                const { transaction } = meta.request.meta;
                const request = state[action.meta.request.meta.transaction];
                return new QueryClientError('error', {
                    request,
                    message: `failed to process task [${transaction}]`,
                    cause: payload,
                });
            })
        );
    }

    constructor(queryFn: QueryFn<TType, TArgs>, options?: QueryClientCtorOptions) {
        super((subscriber) => {
            return this.#state.subscribe(subscriber);
        });

        const initial = {};

        this.#state = new FlowSubject<State<TType, TArgs>, Actions>(createReducer(initial));

        this.#subscription = new Subscription(() => this.#state.complete());

        this.#subscription.add(this.#state.addFlow(handleRequests(queryFn)));
        this.#subscription.add(this.#state.addFlow(handleRetry));

        const retry = Object.assign({ count: 0, delay: 0 }, options?.retry);
        this.#subscription.add(this.#state.addFlow(handleFailures(retry)));
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
    ): ActionMap<TType, TArgs>['request']['meta'] {
        const action = (actions as ActionBuilder<TType, TArgs>).request(args, opt);
        this.#state.next(action);
        return action.meta;
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
        /** if no transaction specified, close all connection */
        if (!transaction) {
            for (const key of Object.keys(this.#state.value)) {
                this.cancel(key, `all transactions canceled`);
            }
        } else if (transaction && this.#state.value[transaction]) {
            reason ??= `[${transaction}]: transaction canceled`;
            this.#state.next(actions.cancel({ transaction, reason }));
        }
    }

    /**
     * Process action
     */
    public on<TAction extends keyof ActionMap>(
        type: TAction,
        cb: (action: ActionMap[TAction], subject: QueryClient<TType, TArgs>) => void
    ) {
        return this.#state.addEffect(actions[type].type, (action) => {
            cb(action as ActionMap[TAction], this);
        });
    }

    /** complete and close query */
    public complete() {
        this.#subscription.unsubscribe();
    }

    public asObservable() {
        return this.#state.asObservable();
    }
}

export default QueryClient;
