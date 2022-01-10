import { HttpClient } from './client';
import { IHttpClientConfigurator } from './configurator';

export class ClientNotFoundException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export interface IHttpClientProvider<TClient extends HttpClient = HttpClient> {
    /** check if a client is configured */
    hasClient(key: string): boolean;
    /** create a new http client */
    createClient(key: string): TClient;
    /**
     * Class cast creation of custom client
     * @example
     * ```ts
     * config.http.configureClient('foobar', (client) => {
     *   client.ctor = MyClient;
     *   client.uri = 'https://foobar.com';
     * });
     */
    createCustomClient<T extends HttpClient>(key: string): T;
}

export class HttpClientProvider<TClient extends HttpClient>
    implements IHttpClientProvider<TClient>
{
    constructor(protected config: IHttpClientConfigurator<TClient>) {}

    public hasClient(key: string): boolean {
        return Object.keys(this.config.clients).includes(key);
    }

    public createClient(key: string): TClient {
        if (!this.hasClient(key)) {
            throw new ClientNotFoundException(`No registered http client for key [${key}]`);
        }
        const {
            defaultUri,
            onCreate,
            ctor = this.config.defaultHttpClientCtor,
            requestHandler = this.config.defaultHttpRequestHandler,
        } = this.config.clients[key];
        const options = { requestHandler };
        const instance = new ctor(defaultUri || '', options) as TClient;
        onCreate && onCreate(instance as TClient);
        return instance as TClient;
    }

    public createCustomClient<T extends HttpClient>(key: string): T {
        return this.createClient(key) as unknown as T;
    }
}
