import type { Module } from '@equinor/fusion-framework-module';
import { AuthConfigurator } from './AuthConfigurator';
import { AuthProvider } from './AuthProvider';
import { AuthTokenProvider } from './AuthTokenProvider';
import { AuthProviderInteractive } from './AuthProviderInteractive';
import type { IAuthProvider } from './AuthProvider.interface';

/**
 * MSAL Node authentication module for the Fusion Framework.
 *
 * This module provides authentication capabilities for Node.js applications using Microsoft's MSAL library.
 * It supports multiple authentication modes: token-only, interactive (browser-based), and silent (cached credentials).
 *
 * The module exposes a unified provider interface for acquiring tokens and managing authentication state.
 *
 * - In `token_only` mode, a static access token is used (see {@link AuthTokenProvider}).
 * - In `interactive` mode, the user is prompted via a local server and browser (see {@link AuthProviderInteractive}).
 * - In all other cases, silent authentication is attempted using cached credentials (see {@link AuthProvider}).
 *
 * @see AuthProvider
 * @see AuthProviderInteractive
 * @see AuthTokenProvider
 * @see IAuthProvider
 * @see AuthConfigurator
 */
export type MsalNodeModule = Module<'auth', IAuthProvider, AuthConfigurator>;

export const module: MsalNodeModule = {
  name: 'auth',
  configure: () => new AuthConfigurator(),
  initialize: async (args) => {
    const config = await args.config.createConfigAsync(args);

    switch (config.mode) {
      case 'token_only':
        return new AuthTokenProvider(config.accessToken);

      case 'interactive': {
        const { client, server } = config;
        if (!server) {
          throw new Error('Server configuration is required for interactive mode');
        }
        return new AuthProviderInteractive(client, { server });
      }

      default:
        return new AuthProvider(config.client);
    }
  },
};

export default module;
