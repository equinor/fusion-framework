import { firstValueFrom, Observable, ObservableInput, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

export type HttpRequestInit = RequestInit & { uri: string; path: string };

export type HandlerOperator<T> = (request: T) => T | void | Promise<T | void>;

export class OperatorHandler<T> {
    protected _operators: Record<string, HandlerOperator<T>> = {};
    add(name: string, operator: HandlerOperator<T>): OperatorHandler<T> {
        if (Object.keys(this._operators).includes(name))
            throw Error(`Operator [${name}] allready defined`);
        return this.set(name, operator);
    }
    set(name: string, operator: HandlerOperator<T>): OperatorHandler<T> {
        this._operators[name] = operator;
        return this;
    }
    get(name: string): HandlerOperator<T> {
        return this._operators[name];
    }
    process(request: T): Promise<T> {
        return Object.values(this._operators).reduce(async (acc, value) => {
            return Promise.resolve(value(await acc)) as Promise<T>;
        }, Promise.resolve(request) as Promise<T>);
    }
}

export class HttpRequestHandler<
    T extends HttpRequestInit = HttpRequestInit
> extends OperatorHandler<T> {
    setHeader(name: string, value: string): HttpRequestHandler<T> {
        return this.set('header-' + name, (request) => {
            const headers = new Headers(request.headers);
            headers.append(name, value);
            return { ...request, headers };
        }) as unknown as HttpRequestHandler<T>;
    }
}

export class HttpResponseHandler<T extends Response = Response> extends OperatorHandler<T> {}

export type HttpClientCreateOptions<T extends HttpRequestInit = HttpRequestInit> = {
    requestHandler: HttpRequestHandler<T>;
};

export class HttpClient<TInit extends HttpRequestInit = HttpRequestInit> {
    readonly requestHandler: HttpRequestHandler<TInit>;
    constructor(public uri: string, options?: HttpClientCreateOptions<TInit>) {
        this.requestHandler = options?.requestHandler || new HttpRequestHandler<TInit>();
        this._init();
    }

    protected _init(): void {
        // called by children for constructor setup
    }

    protected _prepareRequest(init: TInit): ObservableInput<TInit> {
        return this.requestHandler.process(init);
    }

    protected _postRequest(response: Response): Response {
        return response;
    }

    protected _resolveUrl(path: string): string {
        return [this.uri, path].join('/');
    }

    fetch(init: Omit<TInit, 'uri'> | string): Observable<Response> {
        const options = typeof init === 'string' ? { path: init } : init;
        return of({ ...options, uri: this._resolveUrl(options.path) } as TInit).pipe(
            switchMap(this._prepareRequest),
            switchMap(({ uri, path: _path, ...args }) => fromFetch(uri, args)),
            // TODO catch error and run error operators
            map(this._postRequest)
        );
    }
    fetchAsync(init: Omit<TInit, 'uri'> | string): Promise<Response> {
        return firstValueFrom(this.fetch(init));
    }
}
