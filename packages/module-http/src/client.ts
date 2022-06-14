import { firstValueFrom, Observable, ObservableInput, of, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

import { ProcessOperators } from './process-operators';
import { jsonSelector } from './selector';

export type FetchRequest = RequestInit & {
    uri: string;
    path: string;
};

export type FetchRequestInit<
    TReturn = unknown,
    TRequest = FetchRequest,
    TResponse = Response
> = Omit<TRequest, 'uri' | 'path'> & {
    selector?: (response: TResponse) => ObservableInput<TReturn>;
};

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
        return this.set('header-' + key, (request) => {
            const headers = new Headers(request.headers);
            headers.append(key, value);
            return { ...request, headers };
        }) as unknown as HttpRequestHandler<T>;
    }
}

export class HttpResponseHandler<T = Response> extends ProcessOperators<T> {}

export type HttpClientCreateOptions<
    TRequest extends FetchRequest = FetchRequest,
    TResponse = Response
> = {
    requestHandler: HttpRequestHandler<TRequest>;
    responseHandler: HttpResponseHandler<TResponse>;
};

// export type HttpResponseHandler<T> = (response: Response) => Promise<T>;

/**
 * @template TRequest request arguments @see {@link https://developer.mozilla.org/en-US/docs/Web/API/request|request}
 * @template TResponse request arguments @see {@link https://developer.mozilla.org/en-US/docs/Web/API/response|response}
 */
export interface IHttpClient<TRequest extends FetchRequest = FetchRequest, TResponse = Response> {
    uri: string;
    /** pre-processor of requests */
    readonly requestHandler: HttpRequestHandler<TRequest>;
    /** post-processor of requests */
    readonly responseHandler: HttpResponseHandler<TResponse>;

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
    fetch<T = TResponse>(
        path: string,
        init?: FetchRequestInit<T, TRequest, TResponse>
    ): Observable<T>;

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
    fetchAsync<T = TResponse>(
        path: string,
        init?: FetchRequestInit<T, TRequest, TResponse>
    ): Promise<T>;

    json<T = TResponse>(
        path: string,
        init?: FetchRequestInit<T, TRequest, TResponse>
    ): Observable<T>;

    jsonAsync<T = TResponse>(
        path: string,
        init?: FetchRequestInit<T, TRequest, TResponse>
    ): Promise<T>;

    /**
     * Abort all ongoing request for current client
     */
    abort(): void;
}

/** Base http client for executing requests */
export class HttpClient<TRequest extends FetchRequest = FetchRequest, TResponse = Response>
    implements IHttpClient<TRequest, TResponse>
{
    readonly requestHandler: HttpRequestHandler<TRequest>;

    readonly responseHandler: HttpResponseHandler<TResponse>;

    /** stream of requests that are about to be executed  */
    protected _request$ = new Subject<TRequest>();

    /** stream of request responses */
    protected _response$ = new Subject<TResponse>();

    protected _abort$ = new Subject<void>();

    public get request$(): Observable<TRequest> {
        return this._request$.asObservable();
    }

    public get response$(): Observable<TResponse> {
        return this._response$.asObservable();
    }

    constructor(
        public uri: string,
        options?: Partial<HttpClientCreateOptions<TRequest, TResponse>>
    ) {
        this.requestHandler = options?.requestHandler ?? new HttpRequestHandler<TRequest>();
        this.responseHandler = options?.responseHandler ?? new HttpResponseHandler<TResponse>();
        this._init();
    }

    /** internal abstract method, for overriding instead of overriding constructor */
    protected _init(): void {
        // called by children for constructor setup
    }

    public fetch<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Observable<T> {
        return this._fetch(path, args);
    }

    public fetchAsync<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Promise<T> {
        return firstValueFrom(this.fetch<T>(path, args));
    }

    public json<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Observable<T> {
        const body = typeof args?.body === 'object' ? JSON.stringify(args?.body) : args?.body;
        const selector = args?.selector ?? jsonSelector;
        const header = new Headers(args?.headers);
        header.append('Content-Type', 'application/json');
        return this.fetch(path, {
            ...args,
            body,
            selector,
        } as FetchRequestInit<T, TRequest, TResponse>);
    }

    public jsonAsync<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Promise<T> {
        return firstValueFrom(this.json<T>(path, args));
    }

    public abort(): void {
        this._abort$.next();
    }

    protected _fetch<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Observable<T> {
        const { selector, ...options } = Object.assign({}, args || { selector: undefined }, {
            path,
        });
        const response$ = of({
            ...options,
            uri: this._resolveUrl(options.path),
        } as TRequest).pipe(
            /** prepare request, allow extensions to modify request  */
            switchMap((x) => this._prepareRequest(x)),
            /** push request to event buss */
            tap((x) => this._request$.next(x)),
            /** execute request */
            switchMap(({ uri, path: _path, ...args }) => fromFetch(uri, args)),
            /** prepare response, allow extensions to modify response  */
            switchMap((x) => this._prepareResponse(x as unknown as TResponse)),
            /** push response to event buss */
            tap((x) => this._response$.next(x)),

            switchMap((x) => (selector ? selector(x) : Promise.resolve(x))),
            /** cancel request on abort signal */
            takeUntil(this._abort$)
        );
        return response$ as unknown as Observable<T>;
    }

    protected _prepareRequest(init: TRequest): ObservableInput<TRequest> {
        return this.requestHandler.process(init);
    }

    protected _prepareResponse(response: TResponse): ObservableInput<TResponse> {
        return this.responseHandler.process(response);
    }

    protected _resolveUrl(path: string): string {
        const baseUrl = this.uri || window.location.origin;
        return new URL(path, baseUrl).href;
    }
}
