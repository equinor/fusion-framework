import type { Observable } from 'rxjs';
import type { FetchRequest } from '../client';

export type ProcessOperator<T, R = T> = (request: T) => R | void | Promise<R | void>;

/**
 * Container for sync/async operators.
 * Pipes each operator sequential
 */
export interface IProcessOperators<T> {
    /**
     * Add a new operator (throw error if already defined)
     */
    add(key: string, operator: ProcessOperator<T>): IProcessOperators<T>;

    /**
     * Add or sets a operator
     */
    set(key: string, operator: ProcessOperator<T>): IProcessOperators<T>;

    /**
     * Get a operator, will return undefined on invalid key.
     */
    get(key: string): ProcessOperator<T>;

    /**
     *  Process registered processors.
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
