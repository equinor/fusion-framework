import { HttpRequestHandler, FetchRequest, IHttpClient } from './client';

interface HttpClientConstructorOptions<TInit extends FetchRequest> {
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

/**
 * Instance for configuring http client
 * @template TClient base type of client that the provider will create
 */
export interface IHttpClientConfigurator<TClient extends IHttpClient = IHttpClient> {
    readonly clients: Record<string, HttpClientOptions<TClient>>;
    readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;
    readonly defaultHttpRequestHandler: HttpRequestHandler<HttpClientRequestInitType<TClient>>;

    /**
     * Configure a client with arguments
     * @param name name of the client
     * @param args option that are used cor creating a client
     * @example
     * ```ts
     * configurator.http.configureClient('foo',{
     *   baseUri: 'https://foo.bar',
     *   defaultScopes: ['foobar/.default']
     * });
     * ```
     */
    configureClient<T extends TClient>(
        name: string,
        args: HttpClientOptions<T>
    ): HttpClientConfigurator<TClient>;

    /**
     * Configure a simple client by name to an endpoint
     * @param name name of the client
     * @param uri base endpoint for the client
     */
    configureClient(name: string, uri: string): HttpClientConfigurator<TClient>;

    /**
     * Creates a client with callback configuration
     * @param name name of the client
     * @param onCreate callback when a client is created
     * ```ts
     * configurator.http.configureClient('foo',(client) => {
     *   client.requestHandler.add('logger', (request) => console.log(request));
     * });
     * ```
     */
    configureClient<T extends TClient>(
        name: string,
        onCreate: (client: T) => void
    ): HttpClientConfigurator<TClient>;

    /**
     * Check if there is a configuration for provided name
     */
    hasClient(name: string): boolean;
}

/** @inheritdoc */
export class HttpClientConfigurator<TClient extends IHttpClient>
    implements IHttpClientConfigurator<TClient>
{
    protected _clients: Record<string, HttpClientOptions<TClient>> = {};

    /** Get a clone of all configured clients */
    public get clients(): Record<string, HttpClientOptions<TClient>> {
        return { ...this._clients };
    }

    /** default class for creation of http clients */
    readonly defaultHttpClientCtor: HttpClientConstructor<TClient>;

    /** default request handler for http clients, applied on creation */
    readonly defaultHttpRequestHandler = new HttpRequestHandler<
        HttpClientRequestInitType<TClient>
    >();

    /**
     * Create a instance of http configuration
     * @param client defaultHttpRequestHandler
     */
    constructor(client: HttpClientConstructor<TClient>) {
        this.defaultHttpClientCtor = client;
    }

    /** @inheritdoc */
    hasClient(name: string): boolean {
        return Object.keys(this._clients).includes(name);
    }

    /** @inheritdoc */
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
