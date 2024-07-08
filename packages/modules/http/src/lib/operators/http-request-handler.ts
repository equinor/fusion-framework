import { ProcessOperators } from './process-operators';
import { requestOperatorHeader } from './request-operator-header';

import type { FetchRequest } from '../client';

/**
 * Extends the `ProcessOperators` class to handle HTTP requests.
 *
 * This class provides a method to set a header that will apply to all requests made by the `HttpClient`.
 *
 * @see {@link ProcessOperators}
 *
 * @template T - The type of the fetch request, which extends `FetchRequest`.
 */
export class HttpRequestHandler<T extends FetchRequest = FetchRequest> extends ProcessOperators<T> {
    /**
     * Sets a header that will apply to all requests made by the `HttpClient`.
     *
     * @param key - The name of the header to set.
     * @param value - The value of the header to set.
     * @returns The current `HttpRequestHandler` instance, allowing for method chaining.
     */
    setHeader(key: string, value: string): HttpRequestHandler<T> {
        const operator = requestOperatorHeader<T>(key, value);
        return this.set('header-' + key, operator) as HttpRequestHandler<T>;
    }
}

export default HttpRequestHandler;
