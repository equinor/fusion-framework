import { AuthClientOptions, AuthConfigurator, IAuthConfigurator } from './configurator';
import { AuthProvider, IAuthProvider } from './provider';

import type { Module, IModuleConfigurator } from '@equinor/fusion-framework-module';

export type MsalModule = Module<'auth', IAuthProvider, IAuthConfigurator>;

export const module: MsalModule = {
    name: 'auth',
    configure: (refModules) => {
        const configurator = new AuthConfigurator();
        /** check if parent scope has configured msal */
        if (refModules?.auth?.defaultConfig) {
            /** copy configuration from parent scope */
            configurator.configureDefault(refModules.auth.defaultConfig);
        }
        return configurator;
    },
    initialize: async ({ config }) => {
        const authProvider = new AuthProvider(config);
        if (config.requiresAuth) {
            await authProvider.handleRedirect();
            if (!authProvider.defaultAccount) {
                await authProvider.login();
            }
        }
        return authProvider;
    },
};

export const configureMsal = (
    defaultClient: AuthClientOptions,
    args?: {
        clients?: Record<string, AuthClientOptions>;
        requiresAuth?: boolean;
    }
): IModuleConfigurator<MsalModule, unknown> => ({
    module,
    configure: (config) => {
        config.configureDefault(defaultClient);
        if (args?.requiresAuth !== undefined) {
            config.requiresAuth = args?.requiresAuth;
        }
        const { clients } = args ?? {};
        if (clients) {
            Object.entries(clients).forEach(([key, opt]) => config.configureClient(key, opt));
        }
    },
});

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        auth: MsalModule;
    }
}

export default module;
