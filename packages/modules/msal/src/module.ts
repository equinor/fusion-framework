import {
  type Module,
  type IModulesConfigurator,
  SemanticVersion,
} from '@equinor/fusion-framework-module';

import { MsalModuleVersion } from './static';

import { MsalConfigurator } from './MsalConfigurator';
import { MsalProvider, type IMsalProvider } from './MsalProvider';
import type { MsalClientConfig } from './MsalClient';

export type MsalModule = Module<'auth', IMsalProvider, MsalConfigurator, [MsalModule]>;

export const module: MsalModule = {
  name: 'auth',
  version: new SemanticVersion(MsalModuleVersion.Latest),
  configure: () => new MsalConfigurator(),
  initialize: async (init) => {
    const config = await init.config.createConfigAsync(init);

    // configured to use a custom provider
    if (config.provider) {
      return config.provider;
    }

    // check if the provider is defined in the parent module
    const hostProvider = init.ref?.auth;
    if (hostProvider) {
      try {
        return hostProvider.createProxyProvider(
          config.version as MsalModuleVersion,
        ) as IMsalProvider;
      } catch (error) {
        console.error('MsalModule::Failed to create proxy provider', error);
        // just to make sure during migration that the provider is not set
        // TODO - this is scaring, we should throw an error instead
        return hostProvider;
      }
    }

    if (!config.client) {
      throw new Error(
        'Client configuration is required when provider is not in the parent module nor defined',
      );
    }

    // create a new provider
    const provider = new MsalProvider(config);

    // initialize the provider
    await provider.initialize();

    return provider;
  },
};

export type AuthConfigFn = (builder: {
  setClientConfig: (config: MsalClientConfig) => void;
  setRequiresAuth: (requiresAuth: boolean) => void;
}) => void;

export const enableMSAL = (
  // @biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
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
