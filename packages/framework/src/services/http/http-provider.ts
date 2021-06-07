import { HttpClient } from './http-client';
import { HttpClientConfigurator } from './http-configurator';

export class HttpClientProvider<TClient extends HttpClient = HttpClient> {
    constructor(protected config: HttpClientConfigurator<TClient>) {}

    createClient<T = TClient>(name: string): T {
        const {
            defaultUri,
            onCreate,
            ctor = this.config.defaultHttpClientCtor,
            requestHandler = this.config.defaulHttpRequestHandler,
        } = this.config.clients[name];
        const options = { requestHandler };
        const instance = new ctor(defaultUri || '', options) as TClient;
        onCreate && onCreate(instance as TClient);
        return instance as unknown as T;
    }
}
