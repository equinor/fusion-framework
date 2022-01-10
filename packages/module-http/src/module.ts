import { HttpClientMsal } from './client-msal';
import { IHttpClientConfigurator, HttpClientConfigurator } from './configurator';
import { IHttpClientProvider, HttpClientProvider } from './provider';

import type { Module, ModulesConfigType } from '@equinor/fusion-framework-module';

export type HttpModule = Module<
    'http',
    IHttpClientProvider<HttpClientMsal>,
    IHttpClientConfigurator<HttpClientMsal>
>;

/**
 *  Configure http-client
 */
export const module: HttpModule = {
    name: 'http',
    configure: () => new HttpClientConfigurator(HttpClientMsal),
    initialize: ({ http }): HttpClientProvider<HttpClientMsal> => new HttpClientProvider(http),
};

export const setupHttpModule = (
    config: ModulesConfigType<[HttpModule]>,
    callback: (config: IHttpClientConfigurator<HttpClientMsal>) => void
): void | Promise<void> => {
    callback(config.http);
};

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        http: HttpModule;
    }
}

export default module;
