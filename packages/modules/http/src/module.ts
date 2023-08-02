/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientMsal } from './lib/client';
import { IHttpClientConfigurator, HttpClientConfigurator, HttpClientOptions } from './configurator';
import { IHttpClientProvider, HttpClientProvider } from './provider';

import type {
    Module,
    ModuleConfigType,
    IModuleConfigurator,
} from '@equinor/fusion-framework-module';

import { MsalModule } from '@equinor/fusion-framework-module-msal';

export type HttpModule = Module<'http', IHttpClientProvider, IHttpClientConfigurator>;

export type HttpMsalModule = Module<
    'http',
    IHttpClientProvider<HttpClientMsal>,
    IHttpClientConfigurator<HttpClientMsal>,
    [MsalModule]
>;

/**
 *  Configure http-client
 */
export const module: HttpMsalModule = {
    name: 'http',
    configure: () => new HttpClientConfigurator(HttpClientMsal),
    initialize: async ({
        config,
        hasModule,
        requireInstance,
    }): Promise<HttpClientProvider<HttpClientMsal>> => {
        const httpProvider = new HttpClientProvider(config);
        if (hasModule('auth')) {
            const authProvider = await requireInstance('auth');
            httpProvider.defaultHttpRequestHandler.set('MSAL', async (request) => {
                const { scopes = [] } = request;
                if (scopes.length) {
                    /** TODO should be try catch, check caller for handling */
                    const token = await authProvider.acquireToken({
                        scopes,
                    });
                    if (token) {
                        const headers = new Headers(request.headers);
                        headers.set('Authorization', `Bearer ${token.accessToken}`);
                        return { ...request, headers };
                    }
                }
            });
        }
        return httpProvider;
    },
};

export const configureHttp = <TRef = unknown>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configure: (config: ModuleConfigType<HttpMsalModule>, ref?: TRef) => void,
): IModuleConfigurator<HttpMsalModule, TRef> => ({
    module,
    configure,
});

export const configureHttpClient = <TRef = unknown>(
    name: string,
    args: HttpClientOptions<HttpClientMsal>,
): IModuleConfigurator<HttpMsalModule, TRef> => ({
    module,
    configure: (config: ModuleConfigType<HttpMsalModule>) => {
        config.configureClient(name, args);
    },
});

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        http: HttpMsalModule;
    }
}

export default module;
