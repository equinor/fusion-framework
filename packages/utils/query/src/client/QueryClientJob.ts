import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { type QueryClient, type QueryClientOptions } from './QueryClient';
import { QueryClientError } from './QueryClientError';

import { actions } from './actions';

import { type QueryClientResult } from './types';

type QueryClientJobStatus = 'idle' | 'active' | 'complete' | 'failed' | 'error' | 'canceled';

/**
 * Represents a job for the QueryClient that extends an Observable.
 * It manages the lifecycle of a query operation.
 */
export class QueryClientJob<TType = unknown, TArgs = unknown>
    extends Observable<QueryClientResult<TType, TArgs>>
    implements Disposable
{
    /**
     * The current status of the job.
     */
    #status$ = new BehaviorSubject<QueryClientJobStatus>('idle');

    /**
     * Returns the current status of the job.
     */
    get status() {
        return this.#status$.value;
    }

    get status$() {
        return this.#status$.asObservable();
    }

    /**
     * The QueryClient instance associated with this job.
     */
    #client: QueryClient<TType, TArgs>;

    /**
     * Returns the QueryClient instance associated with this job.
     */
    #transaction: string;

    /**
     * Returns the transaction identifier for this job.
     */
    get transaction() {
        return this.#transaction;
    }

    public readonly created: number = Date.now();

    /**
     * Indicates whether the query client job is closed.
     * A query client job is considered closed if its status is 'complete', 'error', or 'canceled'.
     */
    get closed() {
        return this.status === 'complete' || this.status === 'error' || this.status === 'canceled';
    }

    /**
     * Creates an instance of a QueryClientJob.
     * @param client The QueryClient instance.
     * @param args The arguments to be used for the query.
     * @param options Optional settings for the query client job.
     */
    constructor(
        client: QueryClient<TType, TArgs>,
        args: TArgs,
        options?: Partial<QueryClientOptions>,
    ) {
        super((subscriber) => {
            const { transaction } = this;

            // Filters the actions stream for actions related to this job's transaction.
            const jobActions = client.action$.pipe(
                filter((action) => action.meta.transaction === transaction),
            );

            // Subscribes to the state stream, updating the job's status when a related state entry is emitted.
            subscriber.add(
                client.state$
                    .pipe(
                        // Filters the state stream for entries related to this job's transaction.
                        filter((state) => !!state[transaction]),
                        // Maps the filtered state to the specific entry for this job, extracting its current status.
                        map((state) => state[transaction]),
                    )
                    .subscribe((entry) => {
                        // Updates the internal BehaviorSubject with the new status.
                        // This change is then propagated to all subscribers of the status$ Observable,
                        // allowing them to react to status changes in real-time.
                        this.#status$.next(entry.status);
                    }),
            );

            // Subscribes to the actions stream, completing the job when a successful execution action is emitted.
            subscriber.add(
                jobActions
                    .pipe(
                        filter(actions.execute.success.match),
                        // Maps the successful execution action to its payload, effectively extracting the result of the query operation.
                        // This result is then passed along to the subscribers of the QueryClientJob, allowing them to react to the successful completion of the job.
                        map(({ payload }) => payload as QueryClientResult<TType, TArgs>),
                    )
                    .subscribe((result) => {
                        // Updates the job's status to 'complete', indicating that the query operation has successfully finished.
                        this.#status$.next('complete');
                        // Notifies subscribers of the QueryClientJob with the result of the query operation.
                        subscriber.next(result);
                        // Completes the subscription, signaling that the job has finished and no more values will be emitted.
                        // This is an important step to ensure that subscribers can perform any necessary cleanup or final actions.
                        subscriber.complete();
                    }),
            );

            // Subscribes to the actions stream, emitting an error when an error action is emitted.
            subscriber.add(
                jobActions
                    .pipe(
                        filter(actions.error.match),
                        map(({ payload }) => payload),
                    )
                    .subscribe((err) => {
                        this.#status$.next('error');
                        // Emits an error to the subscriber with the error details from the payload.
                        // This triggers the error handling mechanisms of the subscriber, allowing for
                        // appropriate responses to the error condition.
                        subscriber.error(err.error);
                    }),
            );

            // Subscribes to the actions stream, updating the job's status when a cancel action is emitted.
            subscriber.add(
                jobActions.pipe(filter(actions.cancel.match)).subscribe((action) => {
                    this.#status$.next('canceled');
                    // When a cancel action is received, it updates the job's status to 'canceled' and emits an error with a detailed message.
                    // This includes the reason for cancellation if provided, or a default message indicating the job was canceled.
                    // Additionally, it constructs a new `QueryClientError` with the 'abort' type, providing context about the request
                    // associated with the canceled job, allowing for more informed error handling and debugging.
                    subscriber.error(
                        new QueryClientError('abort', {
                            message: action.payload.reason || `job: ${transaction} was canceled`,
                            request: this.#client.getRequest(action.meta.transaction),
                        }),
                    );
                }),
            );

            // If an abort signal is provided, subscribes to the abort event and dispatches a cancel action.
            if (options?.signal) {
                // Subscribes to the abort event on the provided signal. When the abort event is triggered,
                // it dispatches a cancel action with a specific message indicating the job was aborted
                // due to an external signal. This allows for external cancellation mechanisms to interact
                // with the job lifecycle.
                subscriber.add(
                    fromEvent(options?.signal, 'abort')
                        .pipe(
                            // Maps the abort event to a cancel action, including a message that specifies
                            // the transaction ID and an optional reference provided in the options.
                            // This ensures that the cancellation is traceable to the abort signal.
                            map(() =>
                                actions.cancel(
                                    transaction,
                                    `job: ${transaction} was aborted on signal from caller: ${options?.ref}`,
                                ),
                            ),
                        )
                        // Subscribes to the resulting Observable and dispatches the cancel action
                        // to the QueryClient. This integrates the external abort mechanism with
                        // the QueryClient's internal state management and action handling.
                        .subscribe((action) => client.next(action)),
                );
            }

            // Adds a teardown logic to cancel the job if it's still active upon unsubscription.
            subscriber.add(() => {
                this.complete();
            });
        });
        this.#client = client;
        // Dispatches a request action to start the job.
        const request = actions.request(args, { ref: options?.ref, retry: options?.retry });
        this.#transaction = request.meta.transaction;
        this.#client.next(request);
    }

    /**
     * Completes the job if it's not already closed, marking it as 'complete'.
     * This method should be called to gracefully end a job that has finished its task.
     * It will also attempt to cancel the job with a completion reason, transitioning its status to 'canceled'
     * if it was in an 'active' state but hadn't yet completed.
     */
    public complete(reason?: string) {
        if (!this.closed) {
            this.cancel(reason ?? `job: ${this.transaction} was completed`);
        }
    }

    /**
     * Cancels the job with an optional reason, marking its status as 'canceled'.
     * This method is used to prematurely end a job that cannot complete its task, either due to an error or a user-defined condition.
     * Upon cancellation, a cancellation action is dispatched to notify other parts of the application that the job has been canceled.
     * @param reason The reason for the cancellation, which will be included in the cancellation action.
     */
    public cancel(reason?: string) {
        const transaction = this.transaction;
        this.#client.cancel(transaction, reason ?? `job: ${transaction} was canceled`);
    }

    [Symbol.dispose]() {
        this.complete();
    }
}
