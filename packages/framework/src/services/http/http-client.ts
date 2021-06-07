import { firstValueFrom, Observable, ObservableInput, of, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

import { ProcessOperators } from '../../util/process-operators';

export type HttpRequestInit = RequestInit & { uri: string; path: string };

export class HttpRequestHandler<
    T extends HttpRequestInit = HttpRequestInit
> extends ProcessOperators<T> {
    setHeader(name: string, value: string): HttpRequestHandler<T> {
        return this.set('header-' + name, (request) => {
            const headers = new Headers(request.headers);
            headers.append(name, value);
            return { ...request, headers };
        }) as unknown as HttpRequestHandler<T>;
    }
}

export type HttpClientCreateOptions<T extends HttpRequestInit = HttpRequestInit> = {
    requestHandler: HttpRequestHandler<T>;
};

export type HttpResponseHandler<T> = (response: Response) => Promise<T>;

export class HttpClient<TRequest extends HttpRequestInit = HttpRequestInit, TResponse = Response> {
    readonly requestHandler: HttpRequestHandler<TRequest>;

    readonly responseHandler: HttpResponseHandler<TResponse> = (x: Response) =>
        Promise.resolve(x as unknown as TResponse);

    protected _request$ = new Subject<TRequest>();
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

    protected _init(): void {
        // called by children for constructor setup
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

    public fetch(init: Omit<TRequest, 'uri'> | string): Observable<TResponse> {
        const options = typeof init === 'string' ? { path: init } : init;
        return of({ ...options, uri: this._resolveUrl(options.path) } as TRequest).pipe(
            switchMap((x) => this._prepareRequest(x)),
            tap((x) => this._request$.next(x)),
            switchMap(({ uri, path: _path, ...args }) => fromFetch(uri, args)),
            switchMap((x) => this._prepareResponse(x)),
            tap((x) => this._response$.next(x)),
            takeUntil(this._abort$)
        );
    }

    /**
     * Fetch a resource as an promise
     */
    public fetchAsync(init: Omit<TRequest, 'uri'> | string): Promise<TResponse> {
        return firstValueFrom(this.fetch(init));
    }

    /**
     * Abort all ongoing request for current client
     */
    public abort(): void {
        this._abort$.next();
    }
}
