import { HttpRequestHandler, HttpRequestInit, IHttpClient } from './client';

interface HttpClientConstructorOptions<TInit extends HttpRequestInit> {
    requestHandler: HttpRequestHandler<TInit>;
}

interface HttpClientConstructor<TClient extends IHttpClient> {
    new (
        uri: string,
        options: HttpClientConstructorOptions<HttpClientRequestInitType<TClient>>
    ): TClient;
}

interface HttpClientOptions<TClient extends IHttpClient> {
    baseUri?: string;
    defaultScopes?: string[];
    ctor?: HttpClientConstructor<TClient>;
    onCreate?: (client: TClient) => void;
    requestHandler?: HttpRequestHandler<HttpClientRequestInitType<TClient>>;
}

type HttpClientRequestInitType<T extends IHttpClient> = T extends IHttpClient<infer U> ? U : never;

export interface IHttpClientConfigurator<TClient extends IHttpClient = IHttpClient> {
    readonly clients: Record<string, HttpClientOptions<TClient>>;
    readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;
    readonly defaultHttpRequestHandler: HttpRequestHandler<HttpClientRequestInitType<TClient>>;

    configureClient(name: string, uri: string): HttpClientConfigurator<TClient>;

    configureClient<T extends TClient>(
        name: string,
        args: HttpClientOptions<T>
    ): HttpClientConfigurator<TClient>;

    configureClient<T extends TClient>(
        name: string,
        onCreate: (client: T) => void
    ): HttpClientConfigurator<TClient>;

    hasClient(name: string): boolean;
}

export class HttpClientConfigurator<TClient extends IHttpClient>
    implements IHttpClientConfigurator<TClient>
{
    protected _clients: Record<string, HttpClientOptions<TClient>> = {};

    public get clients(): Record<string, HttpClientOptions<TClient>> {
        return { ...this._clients };
    }

    readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;

    readonly defaultHttpRequestHandler = new HttpRequestHandler<
        HttpClientRequestInitType<TClient>
    >();

    constructor(client: HttpClientConstructor<TClient>) {
        this.defaultHttpClientCtor = client;
    }

    hasClient(name: string): boolean {
        return Object.keys(this._clients).includes(name);
    }

    configureClient<T extends TClient>(
        name: string,
        args: string | HttpClientOptions<T> | HttpClientOptions<T>['onCreate']
    ): HttpClientConfigurator<TClient> {
        const argFn = typeof args === 'string' ? (x: T) => (x.uri = String(args)) : args;
        const options = typeof argFn === 'function' ? { onCreate: argFn } : argFn;
        this._clients[name] = {
            ...this._clients[name],
            ...(options as unknown as HttpClientOptions<TClient>),
        };
        return this;
    }
}

export default HttpClientConfigurator;
