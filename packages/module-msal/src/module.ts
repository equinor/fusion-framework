import { AuthConfigurator, IAuthConfigurator } from './configurator';
import { AuthProvider, IAuthProvider } from './provider';

import type { Module, ModulesConfigType } from '@equinor/fusion-framework-module';
import type { HttpModule } from '@equinor/fusion-framework-module-http';

export type MsalModule = Module<'auth', IAuthProvider, IAuthConfigurator, [HttpModule]>;

export const module: MsalModule = {
    name: 'auth',
    configure: (modules) => {
        const configurator = new AuthConfigurator();
        /** check if parent scope has configured msal */
        if (modules?.auth?.defaultConfig) {
            /** copy configuration from parent scope */
            configurator.configureDefault(modules.auth.defaultConfig);
        }
        return configurator;
    },
    initialize: (config, modules) => {
        if (config.http) {
            /**
             * Add handler for setting token when request is executed
             * TODO - maybe check override
             */
            config.http.defaultHttpRequestHandler.set('MSAL', async (request) => {
                const { scopes = [] } = request;
                if (!scopes.length) {
                    /** TODO should be try catch, check caller for handling */
                    const token = await modules.auth.acquireToken({ scopes });
                    if (token) {
                        const headers = new Headers(request.headers);
                        headers.set('Authorization', `Bearer ${token.accessToken}`);
                        return { ...request, headers };
                    }
                }
            });
        }
        return new AuthProvider(config.auth);
    },
};

export const setupMsalModule = (
    config: ModulesConfigType<[MsalModule]>,
    callback: (config: IAuthConfigurator) => void
): void | Promise<void> => {
    callback(config.auth);
};

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        auth: MsalModule;
    }
}

export default module;
