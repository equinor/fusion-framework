import { firstValueFrom, Observable, ObservableInput, of, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

import { ProcessOperators } from './process-operators';

export type HttpRequestInit = RequestInit & { uri: string; path: string };

/**
 * Extends @see {ProcessOperators} for pre-processing requests.
 */
export class HttpRequestHandler<
    T extends HttpRequestInit = HttpRequestInit
> extends ProcessOperators<T> {
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

export type HttpClientCreateOptions<T extends HttpRequestInit = HttpRequestInit> = {
    requestHandler: HttpRequestHandler<T>;
};

export type HttpResponseHandler<T> = (response: Response) => Promise<T>;

export interface IHttpClient<
    TRequest extends HttpRequestInit = HttpRequestInit,
    TResponse = Response
> {
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
     * @see {@link https://rxjs.dev/api/fetch/fromFetch|RXJS}
     * @example
     * ```ts
     * // Observer changes of a input field
     * const client = window.Fusion.createClient('my-client');
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
    fetch(init: Omit<TRequest, 'uri'> | string): Observable<TResponse>;

    /**
     * Fetch a resource as an promise
     * @example
     * ```ts
     * let controller: AbortController;
     * const client = window.Fusion.createClient('my-client');
     * const input = document.getElementById('input');
     * input.addEventlistner('input', (e) => {
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
    fetchAsync(init: Omit<TRequest, 'uri'> | string): Promise<TResponse>;

    /**
     * Abort all ongoing request for current client
     */
    abort(): void;
}

/** Base http client for executing requests */
export class HttpClient<TRequest extends HttpRequestInit = HttpRequestInit, TResponse = Response>
    implements IHttpClient<TRequest, TResponse>
{
    readonly requestHandler: HttpRequestHandler<TRequest>;

    readonly responseHandler: HttpResponseHandler<TResponse> = (x: Response) =>
        Promise.resolve(x as unknown as TResponse);

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

    constructor(public uri: string, options?: HttpClientCreateOptions<TRequest>) {
        this.requestHandler = options?.requestHandler || new HttpRequestHandler<TRequest>();
        this._init();
    }

    /** internal abstract method, for overriding instead of overriding constructor */
    protected _init(): void {
        // called by children for constructor setup
    }

    public fetch(init: Omit<TRequest, 'uri'> | string): Observable<TResponse> {
        const options = typeof init === 'string' ? { path: init } : init;
        return of({ ...options, uri: this._resolveUrl(options.path) } as TRequest).pipe(
            /** prepare request, allow extensions to modify request  */
            switchMap((x) => this._prepareRequest(x)),
            /** push request to event buss */
            tap((x) => this._request$.next(x)),
            /** execute request */
            switchMap(({ uri, path: _path, ...args }) => fromFetch(uri, args)),
            /** prepare response, allow extensions to modify response  */
            switchMap((x) => this._prepareResponse(x)),
            /** push response to event buss */
            tap((x) => this._response$.next(x)),
            /** cancel request on abort signal */
            takeUntil(this._abort$)
        );
    }

    public fetchAsync(init: Omit<TRequest, 'uri'> | string): Promise<TResponse> {
        return firstValueFrom(this.fetch(init));
    }

    public abort(): void {
        this._abort$.next();
    }

    protected _prepareRequest(init: TRequest): ObservableInput<TRequest> {
        return this.requestHandler.process(init);
    }

    protected _prepareResponse(response: Response): ObservableInput<TResponse> {
        return this.responseHandler(response);
    }

    protected _resolveUrl(path: string): string {
        return [this.uri, path].join('/');
    }
}
