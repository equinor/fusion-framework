import { firstValueFrom, of, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

import { HttpRequestHandler, HttpResponseHandler } from '../operators';
import { jsonSelector } from '../selectors';

import type { Observable, ObservableInput } from 'rxjs';
import type { IHttpRequestHandler, IHttpResponseHandler } from '../operators';
import type { FetchRequest, FetchRequestInit, FetchResponse, IHttpClient, StreamResponse } from '.';
import { HttpResponseError } from '../../errors';

export type HttpClientCreateOptions<
    TRequest extends FetchRequest = FetchRequest,
    TResponse = Response
> = {
    requestHandler: IHttpRequestHandler<TRequest>;
    responseHandler: IHttpResponseHandler<TResponse>;
};

/** Base http client for executing requests */
export class HttpClient<TRequest extends FetchRequest = FetchRequest, TResponse = FetchResponse>
    implements IHttpClient<TRequest, TResponse>
{
    readonly requestHandler: IHttpRequestHandler<TRequest>;

    readonly responseHandler: IHttpResponseHandler<TResponse>;

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

    public fetch$<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): StreamResponse<T> {
        return this._fetch$(path, args);
    }

    public fetch<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Promise<T> {
        return firstValueFrom(this.fetch$<T>(path, args));
    }

    /** @deprecated */
    public fetchAsync<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Promise<T> {
        return this.fetch(path, args);
    }

    public json$<T = unknown>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): StreamResponse<T> {
        const body = typeof args?.body === 'object' ? JSON.stringify(args?.body) : args?.body;
        const selector = args?.selector ?? jsonSelector;
        const headers = new Headers(args?.headers);
        headers.append('Content-Type', 'application/json');
        return this.fetch$(path, {
            ...args,
            body,
            selector,
            headers,
        } as FetchRequestInit<T, TRequest, TResponse>);
    }

    public json<T = unknown>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Promise<T> {
        return firstValueFrom(this.json$<T>(path, args));
    }

    /** @deprecated */
    public jsonAsync<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
    ): Promise<T> {
        return this.json(path, args);
    }

    public execute<T = TResponse, TMethod extends 'fetch' | 'fetch$' | 'json' | 'json$' = 'fetch'>(
        method: TMethod,
        path: string,
        init?: FetchRequestInit<T, TRequest, TResponse>
    ): ReturnType<IHttpClient[TMethod]> {
        return this[method](path, init) as ReturnType<IHttpClient[TMethod]>;
    }

    public abort(): void {
        this._abort$.next();
    }

    protected _fetch$<T = TResponse>(
        path: string,
        args?: FetchRequestInit<T, TRequest, TResponse>
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
                            'failed to parse response',
                            response as Response,
                            {
                                cause: err,
                            }
                        );
                    }
                }
                return of(response);
            }),
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
