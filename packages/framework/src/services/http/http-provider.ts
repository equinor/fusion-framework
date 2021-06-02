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

export class HttpClientProvider<TClient extends HttpClient = HttpClient> {
    protected _clients: Record<string, HttpClientOptions<TClient>> = {};

    readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;

    readonly defaulHttpRequestHandler = new HttpRequestHandler<
        HttpClientRequestInitType<TClient>
    >();

    constructor(client: HttpClientConstructor<TClient>) {
        this.defaultHttpClientCtor = client;
    }

    configureClient(name: string, uri: string): HttpClientProvider<TClient>;

    configureClient<T extends TClient>(
        name: string,
        args: HttpClientOptions<T>
    ): HttpClientProvider<TClient>;

    configureClient<T extends TClient>(
        name: string,
        onCreate: (client: T) => void
    ): HttpClientProvider<TClient>;

    configureClient<T extends TClient>(
        name: string,
        args: string | HttpClientOptions<T> | HttpClientOptions<T>['onCreate']
    ): HttpClientProvider<TClient> {
        const argFn = typeof args === 'string' ? (x: T) => (x.uri = String(args)) : args;
        const options = typeof argFn === 'function' ? { onCreate: argFn } : argFn;
        this._clients[name] = {
            ...this._clients[name],
            ...(options as unknown as HttpClientOptions<TClient>),
        };
        return this;
    }

    createClient<T = TClient>(name: string): T {
        const {
            defaultUri,
            onCreate,
            ctor = this.defaultHttpClientCtor,
            requestHandler = this.defaulHttpRequestHandler,
        } = this._clients[name];
        const options = { requestHandler };
        // eslint-disable-next-line
        // @ts-ignore
        const instance = new ctor('', options) as TClient;
        defaultUri && (instance.uri = defaultUri);
        onCreate && onCreate(instance as TClient);
        return instance as unknown as T;
    }
}
