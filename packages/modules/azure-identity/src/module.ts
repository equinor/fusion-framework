import type { Module } from '@equinor/fusion-framework-module';
import { AzureIdentityAuthConfigurator, type AzureIdentityAuthConfig } from './configurator.js';
import { AuthProviderDefaultCredential } from './AuthProviderDefaultCredential.js';
import { AuthProviderInteractiveBrowser } from './AuthProviderInteractiveBrowser.js';
import { AuthProviderTokenOnly } from './AuthProviderTokenOnly.js';
import type { IAuthProvider } from './AuthProvider.interface.js';

/**
 * Azure Identity authentication module for the Fusion Framework.
 *
 * Supports three modes:
 *
 * - **`default_credential`** — `DefaultAzureCredential` for CI/CD, managed identity,
 *   and Azure CLI environments.
 * - **`interactive`** — `InteractiveBrowserCredential` for CLI `login` / `logout`
 *   flows with browser-based authentication and OS-level token caching.
 * - **`token_only`** — static access token supplied externally.
 *
 * Registers under the module name `'auth'` so it is a drop-in replacement
 * for `@equinor/fusion-framework-module-msal-node`.
 */
export type AzureIdentityModule = Module<'auth', IAuthProvider, AzureIdentityAuthConfigurator>;

export const module: AzureIdentityModule = {
  name: 'auth',
  configure: () => new AzureIdentityAuthConfigurator(),
  initialize: async (args) => {
    const config: AzureIdentityAuthConfig = await args.config.createConfigAsync(args);

    switch (config.mode) {
      case 'interactive':
        return AuthProviderInteractiveBrowser.create({
          tenantId: config.tenantId,
          clientId: config.clientId,
          redirectPort: config.redirectPort,
          onOpen: config.onOpen,
        });

      case 'token_only':
        return new AuthProviderTokenOnly(config.accessToken);

      default:
        return new AuthProviderDefaultCredential();
    }
  },
};

export default module;
