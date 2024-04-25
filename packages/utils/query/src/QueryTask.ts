import { Subject, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { QueryOptions, QueryTaskCompleted } from './types';
import { QueryClientJob } from './client/QueryClientJob';
import { v4 as generateGUID } from 'uuid';
import { type ILogger } from './logger';

/**
 * The `QueryTask` class is designed to manage and execute query operations efficiently. It extends the RxJS `Subject` to
 * allow for easy subscription to the outcome of the query operation. This class is generic and can be used with any type
 * of query result (`TType`) and arguments (`TArgs`) necessary for executing the query.
 *
 * Upon instantiation, each `QueryTask` is assigned a unique identifier and a timestamp marking its creation. This
 * information, along with the key and arguments provided during construction, are used to manage and track the query
 * throughout its lifecycle.
 *
 * The primary method, `processJob`, takes a `QueryClientJob` and an optional `ILogger` for logging purposes. It processes
 * the job by mapping its result to a `QueryTaskCompleted` object, logging the completion, and then notifying all
 * subscribers of the completion. This method leverages RxJS operators for a clean and manageable implementation.
 *
 * ### Generics:
 * - `TType`: The expected type of the query result. This type will be used to type-check the result of the query operation,
 * ensuring type safety throughout the usage of this class.
 * - `TArgs`: The type of the arguments required to perform the query. This ensures that only the correct types of arguments
 * are passed to execute the query, preventing runtime errors and ensuring type safety.
 *
 * ### Properties:
 * - `key`: A string that represents the key associated with the query. This key is used to identify the query operation.
 * - `args`: The arguments required for performing the query. The type of `args` is generic and specified by `TArgs`.
 * - `options`: An optional parameter that allows for additional configuration of the query execution. This is a partial
 * of `QueryOptions<TType, TArgs>`, allowing for flexibility in specifying query options.
 * - `created`: A read-only property that returns the timestamp marking the creation of the `QueryTask` instance.
 * - `uuid`: A read-only property that returns the unique identifier of the `QueryTask` instance.
 *
 * ### Method:
 * - `processJob(job: QueryClientJob<TType, TArgs>, logger?: ILogger): Subscription`: Processes the provided `QueryClientJob`,
 * applying necessary transformations and finalizations. It returns a `Subscription` to the job's result, allowing for
 * further manipulation or cleanup if necessary.
 *
 * This class provides a robust and type-safe way to handle query operations, making it a valuable tool for managing
 * asynchronous data retrieval and processing within the application.
 *
 * @template TType - The type of the query result.
 * @template TArgs - The type of the query arguments.
 */
export class QueryTask<TType, TArgs> extends Subject<QueryTaskCompleted<TType>> {
    #created: number = Date.now();
    /**
     * Gets the creation timestamp of the query task.
     */
    get created(): number {
        return this.#created;
    }

    #uuid: string = generateGUID();
    /**
     * Gets the unique identifier of the query task.
     */
    get uuid(): string {
        return this.#uuid;
    }

    /**
     * Initializes a new instance of the QueryTask class.
     * @param key A string representing the key associated with the query.
     * @param args The arguments required for performing the query.
     * @param options Optional. Additional options that may influence the query execution.
     */
    constructor(
        public readonly key: string,
        public readonly args: TArgs,
        public readonly options?: Partial<QueryOptions<TType, TArgs>>,
    ) {
        super();
    }

    /**
     * Processes the given `QueryClientJob`, applying necessary transformations and finalizations.
     * Once the job completes, it notifies all subscribers with the result and logs the completion.
     *
     * @param job The `QueryClientJob` to be processed.
     * @param logger Optional. A logger for logging the completion of the job.
     * @returns A subscription to the job's result.
     */
    processJob(job: QueryClientJob<TType, TArgs>, logger?: ILogger): Subscription {
        return job
            .pipe(
                map((result) => {
                    const { key, uuid, created } = this;
                    return {
                        key,
                        uuid,
                        created,
                        status: 'complete',
                        transaction: job.transaction,
                        complete: result.completed,
                        value: result.value,
                    } satisfies QueryTaskCompleted<TType>;
                }),
                finalize(() => {
                    logger?.debug(`QueryTask complete`, {
                        uuid: this.uuid,
                        key: this.key,
                        job: { status: job.status, transaction: job.transaction },
                    });
                    job.complete();
                }),
            )
            .subscribe(this);
    }
}
