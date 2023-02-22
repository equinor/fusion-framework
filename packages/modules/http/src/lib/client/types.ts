import type { ObservableInput, Observable } from 'rxjs';
import type { IHttpRequestHandler, IHttpResponseHandler } from '../operators/types';

export type StreamResponse<T> = Observable<T>;

export type FetchRequest = RequestInit & {
    uri: string;
    path: string;
};

export type JsonRequest<TRequest extends FetchRequest = FetchRequest> = Omit<TRequest, 'body'> & {
    body?: object | string | null;
};

export type FetchResponse<T = unknown> = Response & {
    json(): Promise<T>;
};

export type FetchRequestInit<
    TReturn = unknown,
    TRequest = FetchRequest,
    TResponse = FetchResponse<TReturn>
> = Omit<TRequest, 'uri' | 'path'> & {
    selector?: (response: TResponse) => ObservableInput<TReturn>;
};

export type ClientRequestInit<T extends IHttpClient, TReturn = unknown> = T extends IHttpClient<
    infer TRequest,
    infer TResponse
>
    ? FetchRequestInit<TReturn, TRequest, TResponse>
    : never;

export type ExecutionMethod = 'fetch' | 'fetch$' | 'json' | 'json$';

export type ExecutionMethodParameters<
    TMethod extends ExecutionMethod = 'fetch',
    TClient extends IHttpClient = IHttpClient
> = Parameters<TClient[TMethod]>;

export type ExecutionResponse<
    TMethod extends ExecutionMethod = 'fetch',
    TClient extends IHttpClient = IHttpClient
> = ReturnType<TClient[TMethod]>;

/**
 * @template TRequest request arguments @see {@link https://developer.mozilla.org/en-US/docs/Web/API/request|request}
 * @template TResponse request arguments @see {@link https://developer.mozilla.org/en-US/docs/Web/API/response|response}
 */
export interface IHttpClient<TRequest extends FetchRequest = FetchRequest, TResponse = Response> {
    uri: string;
    /** pre-processor of requests */
    readonly requestHandler: IHttpRequestHandler<TRequest>;
    /** post-processor of requests */
    readonly responseHandler: IHttpResponseHandler<TResponse>;

    /** Observable stream of request */
    request$: Observable<TRequest>;

    /** Observable stream of responses */
    response$: Observable<TResponse>;

    /**
     * Observable request.
     * Simplifies execution of request and
     * note: request will not be executed until subscribe!
     *
     * @see {@link https://rxjs.dev/api/fetch/fromFetch|RXJS}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch|fetch}
     * @example
     * ```ts
     * // Observer changes of a input field
     * const client = modules.http.createClient('my-client');
     * const input$ = fromEvent(document.getElementById('input'), 'input');
     * input$.pipe(
     *   // only call after no key input in .5s
     *   debounceTime(500),
     *   // extract value from event
     *   map(x => x.currentTarget.value),
     *   // only search when text longer than 2 characters
     *   filter(x => x.length >=3),
     *   // query api with input value
     *   switchMap(x => client.fetch(`api/foo?q=${x}`).pipe(
     *     // retry 2 times
     *     retry(2)
     *     // cancel request if new input
     *     takeUntil(input$)
     *   )),
     *   // extract data from response
     *   switchMap(x => x.json()),
     *   // process error
     *   catchError(x => of({error: e.message}))
     * // write result to pre element
     * ).subscribe(console.log);
     * ```
     */
    fetch$<T = TResponse>(
        path: string,
        init?: FetchRequestInit<T, TRequest, TResponse>
    ): StreamResponse<T>;

    /**
     * Fetch a resource as an promise
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch|fetch}
     * @example
     * ```ts
     * let controller: AbortController;
     * const client = window.Fusion.createClient('my-client');
     * const input = document.getElementById('input');
     * input.addEventlistener('input', (e) => {
     *  try{
     *    // if a controller is defined, request might be ongoing
     *    controller && controller.abort();
     *    // create a new abort controller
     *    controller = new AbortController();
     *    // query api with
     *    const response = await client.fetch({
     *      path: `api/foo?q=${e.currentTarget.value}`,
     *      signal: controller.signal,
     *    });
     *    const json = await response.json();
     *    result.innerText = JSON.stringify(json, null, 2)
     *  } catch(err){
     *    result.innerText = 'an error occurred'
     *  } finally{
     *    delete controller;
     *  }
     * });
     * ```
     */
    fetch<T = TResponse>(path: string, init?: FetchRequestInit<T, TRequest, TResponse>): Promise<T>;

    fetchAsync<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Promise<T>;

    json$<T = unknown>(
        path: string,
        init?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>
    ): StreamResponse<T>;

    json<T = unknown>(
        path: string,
        init?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>
    ): Promise<T>;

    jsonAsync<T = unknown>(
        path: string,
        args?: FetchRequestInit<T, JsonRequest<TRequest>, TResponse>
    ): Promise<T>;

    /**
     * Abort all ongoing request for current client
     */
    abort(): void;
}
