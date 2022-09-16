import { ProcessOperators } from './process-operators';
import { requestOperatorHeader } from './request-operator-header';

import type { FetchRequest } from '../client';

/**
 * Extends @see {ProcessOperators} for pre-processing requests.
 */
export class HttpRequestHandler<T extends FetchRequest = FetchRequest> extends ProcessOperators<T> {
    /**
     * Set header that will apply on all requests done by consumer @see {HttpClient}
     * @param key - name of header
     * @param value  - header value
     */
    setHeader(key: string, value: string): HttpRequestHandler<T> {
        const operator = requestOperatorHeader<T>(key, value);
        return this.set('header-' + key, operator) as HttpRequestHandler<T>;
    }
}

export default HttpRequestHandler;
