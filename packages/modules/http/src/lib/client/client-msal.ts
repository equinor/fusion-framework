import type { Observable } from 'rxjs';
import type { FetchRequestInit, FetchRequest, FetchResponse } from '.';
import { HttpClient } from './client';

/**
 * Extends the `FetchRequest` type with an optional `scopes` property, which is an array of strings representing the scopes to be used for the request.
 * This type is used to represent a request that requires authentication using the MSAL (Microsoft Authentication Library) library.
 */
type MsalFetchRequest = FetchRequest & { scopes?: string[] };

/**
 * Extends the `FetchRequestInit` type with an optional `scopes` property, which is an array of strings representing the scopes to be used for the request.
 * This type is used to represent a request that requires authentication using the MSAL (Microsoft Authentication Library) library.
 *
 * @template TReturn - The type of the response object. Defaults to `unknown`.
 * @template TRequest - The type of the request object. Defaults to `FetchRequest`.
 * @template TResponse - The type of the response object. Defaults to `Response`.
 */
type MsalFetchRequestInit<
    TReturn = unknown,
    TRequest = FetchRequest,
    TResponse = FetchResponse,
> = FetchRequestInit<TReturn, TRequest, TResponse> & Pick<MsalFetchRequest, 'scopes'>;

/**
 * Extends the `HttpClient` class to provide MSAL (Microsoft Authentication Library) authentication support.
 *
 * The `HttpClientMsal` class is responsible for handling requests that require authentication using the MSAL library.
 * It extends the `HttpClient` class and adds the following functionality:
 *
 * - `defaultScopes`: An array of strings representing the default scopes to be used for all requests, unless overridden in the request object.
 * - `fetch$`: Overrides the `fetch$` method of the `HttpClient` class to add MSAL authentication support. It takes an optional `MsalFetchRequestInit` object, which can include the `scopes` property to specify the scopes to be used for the request.
 *   - If `scopes` is provided in the `MsalFetchRequestInit` object, it will be used in addition to the `defaultScopes`.
 *   - If `scopes` is not provided, only the `defaultScopes` will be used.
 *
 * @template TRequest - The type of the request object. Defaults to `MsalFetchRequest`.
 * @template TResponse - The type of the response object. Defaults to `FetchResponse`.
 */
export class HttpClientMsal<
    TRequest extends MsalFetchRequest = MsalFetchRequest,
    TResponse extends FetchResponse = FetchResponse,
> extends HttpClient<TRequest, TResponse> {
    /**
     * An array of default scopes to be used for all requests, unless overridden in the request object.
     * This property is used by the `HttpClientMsal` class to add MSAL authentication support to requests.
     */
    public defaultScopes: string[] = [];

    /**
     * Fetches a resource from the specified path, with optional MSAL authentication scopes.
     *
     * This method extends the `HttpClient.fetch$` method to add support for MSAL authentication.
     * If `init.scopes` is provided, it will be used in addition to the `defaultScopes` defined in the `HttpClientMsal` class.
     * If `init.scopes` is not provided, only the `defaultScopes` will be used for the request.
     *
     * @overrides HttpClient.fetch$
     *
     * @param path - The path to the resource to fetch.
     * @param init - An optional `MsalFetchRequestInit` object that can include the `scopes` property.
     * @returns An `Observable` that emits the fetched resource.
     */
    public fetch$<T = TResponse>(
        path: string,
        init?: MsalFetchRequestInit<T, TRequest, TResponse>,
    ): Observable<T> {
        /**
         * Merges the default scopes defined in the `HttpClientMsal` class with the scopes provided in the `init` parameter, if any.
         * This ensures that the request includes the necessary scopes for MSAL authentication.
         */
        const args = Object.assign(init || {}, {
            scopes: this.defaultScopes.concat(init?.scopes || []),
        }) as FetchRequestInit<T, TRequest, TResponse>;

        return super._fetch$(path, args);
    }
}

export default HttpClientMsal;
