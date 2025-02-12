import {
    type Module,
    type IModulesConfigurator,
    SemanticVersion,
    ModulesInstanceType,
} from '@equinor/fusion-framework-module';

import { createProxyProvider } from './create-proxy-provider';
import resolveVersion from './resolve-version';
import { MsalModuleVersion } from './static';

import { AuthConfigurator, AuthProvider, type AuthClientConfig, type IAuthProvider } from './v2';

export { AuthConfig } from './v2';

export type MsalModule = Module<'auth', IAuthProvider, AuthConfigurator, [MsalModule]>;
export type { AuthConfigurator, IAuthProvider };

export const module: MsalModule = {
    name: 'auth',
    version: new SemanticVersion(MsalModuleVersion.Latest),
    configure: (refModules) => {
        const configurator = new AuthConfigurator();

        // Check if the parent module has the auth module
        const provider = (refModules as ModulesInstanceType<[MsalModule]>)?.auth;
        configurator.setProvider(provider);

        return configurator;
    },
    initialize: async (init) => {
        // generate the configuration
        const config = await init.config.createConfigAsync(init);

        // resolve configuration version
        const version = resolveVersion(config.version);

        // check if the provider is defined
        if (config.provider) {
            if (config.client) {
                console.warn(
                    'Client configuration is ignored when using provider from parent module',
                );
            }
            // generate a proxy provider
            return createProxyProvider(config.provider, version.wantedVersion) as IAuthProvider;
        }

        // validate client configuration
        if (!config.client) {
            throw new Error('Client configuration is required when provider is not defined');
        }

        // create a new provider
        const authProvider = new AuthProvider(config.client);

        if (config.requiresAuth) {
            await authProvider.handleRedirect();
            await authProvider.login({ onlyIfRequired: true });
        }

        // check if the version satisfies the latest version, if not create a proxy provider
        const { satisfiesLatest } = resolveVersion(config.version);
        if (!satisfiesLatest) {
            return createProxyProvider(authProvider, config.version) as IAuthProvider;
        }

        return authProvider;
    },
};

export type AuthConfigFn = (builder: {
    setClientConfig: (config: AuthClientConfig) => void;
    setRequiresAuth: (requiresAuth: boolean) => void;
}) => void;

export const enableMSAL = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    configure?: AuthConfigFn,
): void => {
    const config = configure ? configureMsal(configure) : { module };
    configurator.addConfig(config);
};

export const configureMsal = (configure: AuthConfigFn) => ({
    module,
    configure,
});

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        auth: MsalModule;
    }
}

export default module;
