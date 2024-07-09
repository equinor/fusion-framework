import { firstValueFrom, of, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

import { HttpRequestHandler, HttpResponseHandler } from '../operators';
import { blobSelector, jsonSelector } from '../selectors';

import type { Observable, ObservableInput } from 'rxjs';
import type { IHttpRequestHandler, IHttpResponseHandler } from '../operators';
import type {
    BlobResult,
    FetchRequest,
    FetchRequestInit,
    FetchResponse,
    IHttpClient,
    JsonRequest,
    StreamResponse,
} from './types';

import { HttpResponseError } from '../../errors';

/**
 * Configuration options for creating an `HttpClient` instance.
 *
 * @template TRequest - The type of the request object. Defaults to `FetchRequest`.
 * @template TResponse - The type of the response object. Defaults to `Response`.
 * @property {IHttpRequestHandler<TRequest>} requestHandler - A handler for customizing the request before it is sent.
 * @property {IHttpResponseHandler<TResponse>} responseHandler - A handler for customizing the response after it is received.
 */
export type HttpClientCreateOptions<
    TRequest extends FetchRequest = FetchRequest,
    TResponse = Response,
> = {
    requestHandler: IHttpRequestHandler<TRequest>;
    responseHandler: IHttpResponseHandler<TResponse>;
};

/** Base http client for executing requests */
export class HttpClient<
    TRequest extends FetchRequest = FetchRequest,
    TResponse extends FetchResponse = FetchResponse,
> implements IHttpClient<TRequest, TResponse>
{
    /**
     * A request handler that can be used to customize the request before it is sent.
     * This property is part of the `HttpClientCreateOptions` configuration object used to create an `HttpClient` instance.
     */
    public readonly requestHandler: IHttpRequestHandler<TRequest>;

    /**
     * A handler for customizing the response after it is received.
     * This property is part of the `HttpClientCreateOptions` configuration object used to create an `HttpClient` instance.
     */
    public readonly responseHandler: IHttpResponseHandler<TResponse>;

    /**
     * A stream of requests that are about to be executed.
     * This property is used internally by the `HttpClient` class to manage the lifecycle of requests.
     */
    protected _request$ = new Subject<TRequest>();

    /**
     * A stream of responses that have been received.
     * This property is used internally by the `HttpClient` class to manage the lifecycle of responses.
     */
    protected _response$ = new Subject<TResponse>();

    /**
     * A stream that is used to signal the abortion of requests.
     * This property is used internally by the `HttpClient` class to manage the lifecycle of requests.
     */
    protected _abort$ = new Subject<void>();

    /**
     * A stream of requests that are about to be executed.
     */
    public get request$(): Observable<TRequest> {
        return this._request$.asObservable();
    }

    /**
     * A stream of responses that have been received.
     */
    public get response$(): Observable<TResponse> {
        return this._response$.asObservable();
    }

    constructor(
        public uri: string,
        options?: Partial<HttpClientCreateOptions<TRequest, TResponse>>,
    ) {
        this.requestHandler = new HttpRequestHandler<TRequest>(options?.requestHandler);
        this.responseHandler = new HttpResponseHandler<TResponse>(options?.responseHandler);
        this._init();
    }

    /**
     * Internal method called by child classes to perform initialization logic in the constructor.
     * This method is intended to be overridden by child classes to add their own initialization logic.
     * @protected
     * @virtual
     */
    protected _init(): void {
        // called by children for constructor setup
    }

    /**
     * Fetches data from the specified path and returns a stream response.
     *
     * @param path - The path to fetch data from.
     * @param args - Optional request initialization options, including a custom selector function.
     * @returns A stream response containing the fetched data.
     */
    public fetch$<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>,
    ): StreamResponse<T> {
        return this._fetch$(path, args);
    }

    /**
     * Fetches data from the specified path and returns a Promise containing the fetched data.
     *
     * @param path - The path to fetch data from.
     * @param args - Optional request initialization options, including a custom selector function.
     * @returns A Promise containing the fetched data.
     */
    public fetch<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>,
    ): Promise<T> {
        return firstValueFrom(this.fetch$<T>(path, args));
    }

    /** @deprecated */
    public fetchAsync<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>,
    ): Promise<T> {
        return this.fetch(path, args);
    }

    /**
     * Fetches data from the specified path and returns a stream response containing the data in JSON format.
     *
     * @param path - The path to fetch the data from.
     * @param args - Optional request initialization options, including a custom selector function and request body.
     *   - `body`: The request body, which will be automatically serialized to JSON if it's an object.
     *   - `selector`: A custom selector function to transform the response data. If not provided, the `jsonSelector` function will be used.
     *   - `headers`: Additional headers to include in the request. The `Accept` and `Content-Type` headers will be automatically set to `application/json`.
     * @returns A stream response containing the fetched data in JSON format.
     */
    public json$<T = unknown>(
        path: string,
        args?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>,
    ): StreamResponse<T> {
        const body = typeof args?.body === 'object' ? JSON.stringify(args?.body) : args?.body;
        const selector = args?.selector ?? jsonSelector;
        const headers = new Headers(args?.headers);
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        return this.fetch$(path, {
            ...args,
            body,
            selector,
            headers,
        } as FetchRequestInit<T, TRequest, TResponse>);
    }

    /**
     * Fetches data from the specified path and returns a Promise containing the fetched data in JSON format.
     *
     * @param path - The path to fetch the data from.
     * @param args - Optional request initialization options, including a custom selector function and request body.
     *   - `body`: The request body, which will be automatically serialized to JSON if it's an object.
     *   - `selector`: A custom selector function to transform the response data. If not provided, the `jsonSelector` function will be used.
     *   - `headers`: Additional headers to include in the request. The `Accept` and `Content-Type` headers will be automatically set to `application/json`.
     * @returns A Promise containing the fetched data in JSON format.
     */
    public json<T = unknown>(
        path: string,
        args?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>,
    ): Promise<T> {
        return firstValueFrom(this.json$<T>(path, args));
    }

    /**
     * Fetches a blob resource from the specified path and returns a stream response.
     *
     * @param path - The path to the blob resource.
     * @param args - Optional request initialization options, including a custom selector function.
     * @returns A stream response containing the fetched blob data.
     */
    public blob$<T = BlobResult>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>,
    ): StreamResponse<T> {
        // Get the selector value from the provided args, or use the default blobSelector
        const selector = args?.selector ?? blobSelector;

        // Create the FetchRequestInit object with the provided args and the selector
        const init = {
            ...args,
            selector,
        } as FetchRequestInit<T, TRequest, TResponse>;

        // Call the fetch$ method with the provided path and the constructed init object
        return this.fetch$(path, init);
    }

    /**
     * Fetches a blob from the specified path and returns a Promise that resolves to the blob result.
     *
     * @param path - The path to fetch the blob from.
     * @param args - Optional arguments for the fetch request, including request body, headers, and response type.
     * @returns A Promise that resolves to the blob result.
     */
    public blob<T = BlobResult>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>,
    ): Promise<T> {
        return firstValueFrom(this.blob$(path, args));
    }

    /** @deprecated */
    public jsonAsync<T = unknown>(
        path: string,
        args?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>,
    ): Promise<T> {
        return this.json(path, args);
    }

    /**
     * Executes an HTTP request using the specified method and path.
     *
     * @param method - The HTTP method to use for the request, such as 'fetch', 'json', or 'blob'.
     * @param path - The path to the resource to fetch.
     * @param init - Optional request initialization options, including request body, headers, and response type.
     * @returns The result of the HTTP request, which will be of the same type as the return value of the specified method.
     */
    public execute<T = TResponse, TMethod extends 'fetch' | 'fetch$' | 'json' | 'json$' = 'fetch'>(
        method: TMethod,
        path: string,
        init?: FetchRequestInit<T, TRequest, TResponse>,
    ): ReturnType<IHttpClient[TMethod]> {
        return this[method](path, init) as ReturnType<IHttpClient[TMethod]>;
    }

    /**
     * Aborts any ongoing HTTP requests made by this `IHttpClient` instance.
     * This will trigger the `takeUntil` operator in the `_fetch$` method,
     * causing any in-flight requests to be cancelled.
     */
    public abort(): void {
        this._abort$.next();
    }

    /**
     * Fetches data from the specified path and returns an Observable that emits the response.
     *
     * @param path - The path to fetch the data from.
     * @param args - Optional arguments for the fetch request, including a response selector function, request body, headers, and response type.
     * @returns {Observable<T>} An Observable that emits the response data.
     *
     * This method handles the following steps:
     * 1. Resolves the full URL by combining the base URI and the provided path.
     * 2. Prepares the request by passing it through the `requestHandler.process()` method.
     * 3. Executes the fetch request using the prepared request.
     * 4. Prepares the response by passing it through the `responseHandler.process()` method.
     * 5. Applies the optional response selector function to transform the response data.
     * 6. Cancels the request if the `_abort$` observable emits.
     */
    protected _fetch$<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>,
    ): Observable<T> {
        const { selector, ...options } = args || {};
        const response$ = of({
            ...options,
            uri: this._resolveUrl(path),
        } as TRequest).pipe(
            /** prepare request, allow extensions to modify request  */
            switchMap((x) => this._prepareRequest(x)),
            /** push request to event buss */
            tap((x) => this._request$.next(x)),
            /** execute request */
            switchMap(({ uri, path: _path, ...init }) => fromFetch(uri, init)),
            /** prepare response, allow extensions to modify response  */
            switchMap((x) => this._prepareResponse(x as unknown as TResponse)),
            /** push response to event buss */
            tap((x) => this._response$.next(x)),

            /** execute selector */
            switchMap((response) => {
                if (selector) {
                    try {
                        return selector(response);
                    } catch (err) {
                        throw new HttpResponseError(
                            'failed to execute response selector',
                            response as Response,
                            {
                                cause: err,
                            },
                        );
                    }
                }
                return of(response);
            }),
            /** cancel request on abort signal */
            takeUntil(this._abort$),
        );
        return response$ as unknown as Observable<T>;
    }

    /**
     * Prepares the request by passing it through the `requestHandler.process()` method.
     * This method is an implementation detail of the `_fetch$()` method, and is not part of the public API.
     * It takes a `TRequest` object as input, which represents the request data, and returns an `ObservableInput<TRequest>`,
     * which can be used to further process the request before it is executed.
     *
     * @param init The request data to be processed.
     * @returns An `ObservableInput<TRequest>` that represents the processed request.
     */
    protected _prepareRequest(init: TRequest): ObservableInput<TRequest> {
        return this.requestHandler.process(init);
    }

    /**
     * Prepares the response by passing it through the `responseHandler.process()` method.
     * This method is an implementation detail of the `_fetch$()` method, and is not part of the public API.
     * It takes a `TResponse` object as input, which represents the response data, and returns an `ObservableInput<TResponse>`,
     * which can be used to further process the response before it is returned.
     *
     * @param response The response data to be processed.
     * @returns An `ObservableInput<TResponse>` that represents the processed response.
     */
    protected _prepareResponse(response: TResponse): ObservableInput<TResponse> {
        return this.responseHandler.process(response);
    }

    /**
     * Resolves the full URL for a given path by combining it with the base URL.
     * This is a protected method and is an implementation detail of the `HttpClient` class.
     *
     * @param path - The path to be resolved.
     * @returns The full URL for the given path.
     */
    protected _resolveUrl(path: string): string {
        const baseUrl = this.uri || window.location.origin;
        return new URL(path, baseUrl).href;
    }
}
