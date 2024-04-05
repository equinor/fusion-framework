import type { Observable } from 'rxjs';
import type { FetchRequest } from '../client';

export type ProcessOperator<T, R = T> = (request: T) => R | void | Promise<R | void>;

/**
 * Container for sync/async operators.
 * Pipes each operator sequential
 */
/**
 * Represents a collection of process operators.
 * @template T The type of the request being processed.
 */
export interface IProcessOperators<T> {
    /**
     * Gets the operators registered in the collection.
     */
    get operators(): Record<string, ProcessOperator<T>>;

    /**
     * Adds a new operator to the collection.
     * @param key The key to identify the operator.
     * @param operator The process operator to add.
     * @returns The updated collection of process operators.
     * @throws An error if the operator is already defined.
     */
    add(key: string, operator: ProcessOperator<T>): IProcessOperators<T>;

    /**
     * Adds or sets a process operator in the collection.
     * @param key The key to identify the operator.
     * @param operator The process operator to add or set.
     * @returns The updated collection of process operators.
     */
    set(key: string, operator: ProcessOperator<T>): IProcessOperators<T>;

    /**
     * Gets a process operator from the collection.
     * @param key The key of the operator to retrieve.
     * @returns The process operator associated with the key, or undefined if the key is invalid.
     */
    get(key: string): ProcessOperator<T>;

    /**
     * Processes the registered process operators.
     * @param request The request to process.
     * @returns An observable that emits the processed request.
     */
    process(request: T): Observable<T>;
}

export interface IHttpRequestHandler<T extends FetchRequest = FetchRequest>
    extends IProcessOperators<T> {
    /**
     * Set header that will apply on all requests done by consumer @see {HttpClient}
     * @param key - name of header
     * @param value  - header value
     */
    setHeader(key: string, value: string): IHttpRequestHandler<T>;
}

export interface IHttpResponseHandler<T = Response> extends IProcessOperators<T> {}
