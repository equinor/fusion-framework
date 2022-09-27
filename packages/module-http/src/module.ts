/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientMsal } from './lib/client';
import { IHttpClientConfigurator, HttpClientConfigurator, HttpClientOptions } from './configurator';
import { IHttpClientProvider, HttpClientProvider } from './provider';

import type {
    Module,
    ModuleConfigType,
    IModuleConfigurator,
} from '@equinor/fusion-framework-module';

export type HttpModule = Module<'http', IHttpClientProvider, IHttpClientConfigurator>;

export type HttpMsalModule = Module<
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
    initialize: ({ config }): HttpClientProvider => new HttpClientProvider(config),
};

export const configureHttp = <TRef = unknown>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configure: (config: ModuleConfigType<HttpModule>, ref?: TRef) => void
): IModuleConfigurator<HttpModule, TRef> => ({
    module,
    configure,
});

export const configureHttpClient = <TRef = unknown>(
    name: string,
    args: HttpClientOptions
): IModuleConfigurator<HttpModule, TRef> => ({
    module,
    configure: (config: ModuleConfigType<HttpModule>) => {
        config.configureClient(name, args);
    },
});

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        http: HttpMsalModule;
    }
}

export default module;
