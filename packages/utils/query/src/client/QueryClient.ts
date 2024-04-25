import { firstValueFrom, Observable, ReplaySubject, Subscription } from 'rxjs';
import { filter, map, share, withLatestFrom } from 'rxjs/operators';

import { FlowSubject } from '@equinor/fusion-observable';
import { filterAction } from '@equinor/fusion-observable/operators';

import actions, { ActionMap, Actions } from './actions';

import { handleRequests, handleExecution, handleFailure } from './flows';
import { QueryClientError } from './QueryClientError';
import createReducer from './reducer';

import {
    QueryClientState,
    RetryOptions,
    QueryFn,
    QueryClientResult,
    QueryClientRequest,
} from './types';
import { ConsoleLogger, ILogger } from '../logger';
import { QueryClientJob } from './QueryClientJob';

/**
 * Options for configuring the behavior of the `QueryClient`.
 *
 * @property {AbortSignal} [signal] - An instance of AbortSignal to cancel the request. [optional]
 * @property {Partial<RetryOptions>} [retry] - Configuration for retry behavior, including number of retries and delay strategy.
 * @property {string} [ref] - A reference string to associate with a query, which can be used for cancellation or tracking purposes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryClientOptions = {
    signal?: AbortSignal;
    retry?: Partial<RetryOptions>;
    /** Reference to a query for tracking or cancellation. */
    ref?: string;
};

export type QueryClientCtorOptions = {
    /** Configuration for retry behavior, including number of retries and delay strategy. */
    retry?: Partial<RetryOptions>;
    /** Optional logger instance for logging messages. */
    logger?: ILogger;
};

/**
 * QueryClient is a generic class that manages the state of asynchronous queries
 * and their lifecycle. It extends Observable to allow subscribers to react to state changes.
 *
 * It uses a FlowSubject to manage a stream of actions that describe the state changes and
 * side effects such as logging. The internal state is managed by a reducer function that
 * processes these actions.
 *
 * The QueryClient provides several specialized Observables (success$, error$, etc.) to
 * observe particular aspects of the query lifecycle, such as successful results or errors.
 *
 * @template TType The type of the data returned by the query function.
 * @template TArgs The type of the arguments passed to the query function.
 */
export class QueryClient<TType, TArgs> extends Observable<QueryClientState<TArgs>> {
    /** Internal state managed by a FlowSubject. */
    #state: FlowSubject<QueryClientState<TArgs>, Actions>;

    /** Subscription to manage cleanup of resources on completion. */
    #subscription: Subscription;

    /** Logger instance for outputting debug and error information. */
    #logger: ILogger;

    /**
     * Indicates whether the QueryClient has been closed and is no longer accepting new actions.
     * @returns {boolean} A boolean value indicating if the state is closed.
     */
    public get closed(): boolean {
        return this.#state.closed;
    }

    /**
     * An Observable of the current state. It emits the current state of the query client
     * whenever it changes.
     * @returns {Observable<QueryClientState<TArgs>>} An Observable stream of the current state.
     */
    public get state$(): Observable<QueryClientState<TArgs>> {
        return this.#state.asObservable();
    }

    /**
     * An Observable stream of dispatched actions. It allows subscribers to react to
     * specific actions that are dispatched in the system.
     * @returns {Observable<Actions<TType, TArgs>>} An Observable stream of actions.
     */
    public get action$(): Observable<Actions<TType, TArgs>> {
        return this.#state.action$;
    }

    /**
     * An Observable stream of successful query results. It emits the result of a query
     * when it completes successfully.
     * @returns {Observable<TType>} An Observable stream of successful results.
     */
    public get success$(): Observable<TType> {
        return this.action$.pipe(
            filter(actions.execute.success.match),
            map(({ payload }) => payload as TType),
        );
    }

    /**
     * An Observable stream of query errors. It emits an instance of QueryClientError
     * when a query fails to complete.
     * @returns {Observable<QueryClientError>} An Observable stream of query errors.
     */
    public get error$(): Observable<QueryClientError<TArgs>> {
        return this.action$.pipe(
            filterAction('client/error'),
            withLatestFrom(this.#state),
            map(([action, state]) => {
                const {
                    payload,
                    meta: { transaction },
                } = action;
                const request = state[transaction];
                return new QueryClientError('error', {
                    request,
                    message: `job: ${transaction} failed`,
                    cause: payload,
                });
            }),
        );
    }

    /**
     * Creates an instance of QueryClient.
     * @param {QueryFn<TType, TArgs>} queryFn A function that performs the asynchronous query.
     * @param {QueryClientCtorOptions} [options] Optional configuration options for the QueryClient.
     */
    constructor(queryFn: QueryFn<TType, TArgs>, options?: QueryClientCtorOptions) {
        super((subscriber) => {
            return this.#state.subscribe(subscriber);
        });

        this.#state = new FlowSubject(createReducer({}));

        this.#subscription = new Subscription(() => this.#state.complete());

        // Add flows to handle different aspects of the query lifecycle.
        this.#subscription.add(this.#state.addFlow(handleRequests));
        this.#subscription.add(this.#state.addFlow(handleExecution(queryFn)));
        this.#subscription.add(
            this.#state.addFlow(
                handleFailure(Object.assign({ count: 0, delay: 0 }, options?.retry)),
            ),
        );

        // Initialize the logger or use the provided one.
        this.#logger = options?.logger ?? new ConsoleLogger('QueryClient');

        // Register effects to log different actions.
        this.#state.addEffect(actions.request.type, ({ payload, meta: { transaction } }) => {
            this.#logger.debug('Job requested', { transaction, payload });
        });

        this.#state.addEffect(actions.execute.type, ({ payload, meta: { transaction } }) => {
            this.#logger.debug('Job executing', { transaction, payload });
        });

        this.#state.addEffect(actions.execute.success.type, ({ payload }) => {
            this.#logger.info('Job complete', { ...payload });
        });

        this.#state.addEffect(
            actions.execute.failure.type,
            ({ payload, meta: { transaction } }) => {
                this.#logger.debug('Job failed', { transaction, payload });
            },
        );

        this.#state.addEffect(
            actions.cancel.type,
            ({ payload: { reason }, meta: { transaction } }) => {
                this.#logger.debug('Job canceled', { transaction, reason });
            },
        );

        this.#state.addEffect(actions.error.type, ({ payload: { transaction, error } }) => {
            this.#logger.error('Job error', { transaction, error });
        });
    }

    /**
     * Dispatches an action to the internal state subject, which will be processed by the reducer
     * and any registered effects.
     * @param {Actions} action The action to dispatch.
     */
    public next(action: Actions): void {
        this.#state.next(action);
    }

    /**
     * Initiates a query with the provided arguments and options. It returns a QueryClientJob
     * which is an Observable that represents the lifecycle of the query.
     * @param {TArgs} args Call arguments for the query function.
     * @param {Partial<QueryClientOptions>} [opt] Query options.
     * @returns {QueryClientJob<TType, TArgs>} The QueryClientJob representing the initiated query.
     */
    public query(args: TArgs, opt?: Partial<QueryClientOptions>): QueryClientJob<TType, TArgs> {
        const job = new QueryClientJob(this, args, opt);
        const job$ = job.pipe(
            share({ connector: () => new ReplaySubject(), resetOnRefCountZero: false }),
        );
        Object.defineProperties(job$, {
            transaction: { get: () => job.transaction },
            created: { get: () => job.created },
            status: { get: () => job.status },
            closed: { get: () => job.closed },
            cancel: { value: (reason: string) => job.cancel(reason) },
            complete: { value: () => job.complete() },
        });
        return job$ as unknown as QueryClientJob<TType, TArgs>;
    }

    /**
     * Initiates a query and returns a promise that resolves with the result of the query.
     * It is a convenience method that wraps the query method for use with async/await syntax.
     * @param {TArgs} args Call arguments for the query function.
     * @param {QueryClientOptions} [opt] Query options.
     * @returns {Promise<QueryClientResult<TType>>} A promise that resolves with the result of the query.
     */
    public async nextAsync(
        args: TArgs,
        opt?: QueryClientOptions,
    ): Promise<QueryClientResult<TType>> {
        return firstValueFrom(this.query(args, opt));
    }

    /**
     * Retrieves the request associated with the specified transaction.
     *
     * @param transaction - The transaction identifier.
     * @returns The request associated with the specified transaction.
     */
    public getRequest(transaction: string): QueryClientRequest<TArgs> | undefined {
        return this.#state.value[transaction];
    }

    public getRequestByRef(ref: string): QueryClientRequest<TArgs> | undefined {
        return Object.values(this.#state.value).find((x) => x.ref === ref);
    }

    /**
     * Cancels a task by its reference string. If a reason is provided, it will be included
     * in the cancellation effect.
     * @param {string} ref The reference string of the task to cancel.
     * @param {string} [reason] The reason for cancellation.
     */
    public cancelTaskByRef(ref: string, reason?: string): void {
        const entry = this.getRequestByRef(ref);
        if (entry?.ref) {
            this.cancel(entry.transaction, reason);
        }
    }

    /**
     * Cancels a query. If a transaction id is provided, it cancels the specific query.
     * Otherwise, it cancels all queries.
     * @param {string} [transaction] The transaction id of the query to cancel.
     * @param {string} [reason] The reason for cancellation.
     */
    public cancel(transaction?: string, reason?: string): void {
        if (!transaction) {
            // If no specific transaction is provided, iterate through all transactions
            // in the state and cancel each one, applying a generic cancellation reason.
            for (const key of Object.keys(this.#state.value)) {
                this.cancel(key, `all transactions requested canceled`);
            }
        } else if (this.#state.value[transaction]) {
            // If a specific transaction is provided and it exists in the state,
            // dispatch a cancellation action with an optional reason or a default message.
            reason ??= `cancelation requested for job: ${transaction}`;
            this.#state.next(actions.cancel(transaction, reason));
        } else {
            // If a specific transaction is provided but it does not exist in the state,
            // log a warning indicating that there is nothing to cancel.
            this.#logger.warn(`Task not registered, nothing to cancel`, {
                transaction,
                reason,
            });
        }
    }

    /**
     * Registers a callback to be executed when an action of the specified type is dispatched.
     * It allows for custom behavior to be defined in response to specific actions.
     * @template TAction The type of the action to listen for.
     * @param {TAction} type The type of the action.
     * @param {(action: ActionMap[TAction], subject: QueryClient<TType, TArgs>) => void} cb The callback to execute.
     * @returns {Subscription} A Subscription that can be used to unregister the effect.
     */
    public on<TAction extends keyof ActionMap>(
        type: TAction,
        cb: (action: ActionMap[TAction], subject: QueryClient<TType, TArgs>) => void,
    ) {
        return this.#state.addEffect(actions[type].type, (action) => {
            cb(action as ActionMap[TAction], this);
        });
    }

    /**
     * Completes the QueryClient's internal state subject, effectively cleaning up all
     * resources and subscriptions. After calling complete, the QueryClient will no longer
     * accept new actions or emit new state changes.
     */
    public complete() {
        this.#subscription.unsubscribe();
    }
}

export default QueryClient;
