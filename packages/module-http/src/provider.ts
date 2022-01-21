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

const isURL = (url: string) => {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$',
        'i'
    ); // fragment locator
    return pattern.test(url);
};

export class HttpClientProvider<TClient extends HttpClient>
    implements IHttpClientProvider<TClient>
{
    constructor(protected config: IHttpClientConfigurator<TClient>) {}

    public hasClient(key: string): boolean {
        return Object.keys(this.config.clients).includes(key);
    }

    public createClient(key: string): TClient {
        let config = this.config.clients[key];
        if (!config && isURL(key)) {
            config = { baseUri: key };
        } else if (!config) {
            throw new ClientNotFoundException(`No registered http client for key [${key}]`);
        }
        const {
            baseUri,
            onCreate,
            ctor = this.config.defaultHttpClientCtor,
            requestHandler = this.config.defaultHttpRequestHandler,
        } = config;
        const options = { requestHandler };
        const instance = new ctor(baseUri || '', options) as TClient;
        onCreate && onCreate(instance as TClient);
        return instance as TClient;
    }

    public createCustomClient<T extends HttpClient>(key: string): T {
        return this.createClient(key) as unknown as T;
    }
}
