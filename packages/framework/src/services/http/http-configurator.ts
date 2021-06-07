import { HttpClient, HttpRequestHandler, HttpRequestInit } from './http-client';

interface HttpClientConstructorOptions<TInit extends HttpRequestInit> {
    requestHandler: HttpRequestHandler<TInit>;
}

interface HttpClientConstructor<TClient extends HttpClient> {
    new (
        uri: string,
        options: HttpClientConstructorOptions<HttpClientRequestInitType<TClient>>
    ): TClient;
}

interface HttpClientOptions<TClient extends HttpClient> {
    defaultUri?: string;
    ctor?: HttpClientConstructor<TClient>;
    onCreate?: (client: TClient) => void;
    requestHandler?: HttpRequestHandler<HttpClientRequestInitType<TClient>>;
}

type HttpClientRequestInitType<T extends HttpClient> = T extends HttpClient<infer U> ? U : never;

export class HttpClientConfigurator<TClient extends HttpClient = HttpClient> {
    protected _clients: Record<string, HttpClientOptions<TClient>> = {};

    public get clients(): Record<string, HttpClientOptions<TClient>> {
        return { ...this._clients };
    }

    readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;

    readonly defaulHttpRequestHandler = new HttpRequestHandler<
        HttpClientRequestInitType<TClient>
    >();

    constructor(client: HttpClientConstructor<TClient>) {
        this.defaultHttpClientCtor = client;
    }

    configureClient(name: string, uri: string): HttpClientConfigurator<TClient>;

    configureClient<T extends TClient>(
        name: string,
        args: HttpClientOptions<T>
    ): HttpClientConfigurator<TClient>;

    configureClient<T extends TClient>(
        name: string,
        onCreate: (client: T) => void
    ): HttpClientConfigurator<TClient>;

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
