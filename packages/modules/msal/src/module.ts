import {
  type Module,
  type IModulesConfigurator,
  SemanticVersion,
} from '@equinor/fusion-framework-module';

import { MsalModuleVersion } from './static';

import { AuthConfigurator, AuthProvider, type AuthClientConfig, type IAuthProvider } from './v2';

export type MsalModule = Module<'auth', IAuthProvider, AuthConfigurator, [MsalModule]>;
export type { AuthConfigurator, IAuthProvider };

export const module: MsalModule = {
  name: 'auth',
  version: new SemanticVersion(MsalModuleVersion.Latest),
  configure: () => new AuthConfigurator(),
  initialize: async (init) => {
    const config = await init.config.createConfigAsync(init);

    // configured to use a custom provider
    if (config.provider) {
      return config.provider;
    }

    // check if the provider is defined in the parent module
    const hostProvider = init.ref?.auth as AuthProvider;
    if (hostProvider) {
      try {
        return hostProvider.createProxyProvider(config.version);
      } catch (error) {
        console.error('MsalModule::Failed to create proxy provider', error);
        // just to make sure during migration that the provider is not set
        return hostProvider;
      }
    }

    if (!config.client) {
      throw new Error(
        'Client configuration is required when provider is not in the parent module nor defined',
      );
    }

    // create a new provider
    const authProvider = new AuthProvider(config.client);

    if (config.requiresAuth) {
      await authProvider.handleRedirect();
      await authProvider.login({ onlyIfRequired: true });
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
