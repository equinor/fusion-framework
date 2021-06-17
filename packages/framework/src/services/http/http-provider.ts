import { HttpClient } from './http-client';
import { HttpClientConfigurator } from './http-configurator';

export class ClientNotFoundException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class HttpClientProvider<TClient extends HttpClient = HttpClient> {
    constructor(protected config: HttpClientConfigurator<TClient>) {}

    hasClient(key: string): boolean {
        return Object.keys(this.config.clients).includes(key);
    }

    createClient<T = TClient>(key: string): T {
        if (!this.hasClient(key)) {
            throw new ClientNotFoundException(`No registered http client for key [${key}]`);
        }
        const {
            defaultUri,
            onCreate,
            ctor = this.config.defaultHttpClientCtor,
            requestHandler = this.config.defaulHttpRequestHandler,
        } = this.config.clients[key];
        const options = { requestHandler };
        const instance = new ctor(defaultUri || '', options) as TClient;
        onCreate && onCreate(instance as TClient);
        return instance as unknown as T;
    }
}
