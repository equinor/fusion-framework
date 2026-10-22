import type { Module } from '@equinor/fusion-framework-module';
import { AuthConfigurator } from './AuthConfigurator.js';
import { AuthProvider } from './AuthProvider.js';
import { AuthTokenProvider } from './AuthTokenProvider.js';
import { connectAuthTelemetry } from './connect-auth-telemetry.js';
import { AuthProviderInteractive } from './AuthProviderInteractive.js';
import { AuthProviderDeviceCode } from './AuthProviderDeviceCode.js';
import type { IAuthProvider } from './AuthProvider.interface.js';

/** Telemetry disconnects owned by each initialized provider, released on module disposal. */
const telemetryConnections = new WeakMap<object, () => void>();

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
 * - In `device_code` mode, the user authenticates by entering a code at a URL on any device (see {@link AuthProviderDeviceCode}). Recommended for CLI tools.
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

    // Build the appropriate provider implementation for the configured auth mode
    switch (config.mode) {
      case 'token_only':
        return new AuthTokenProvider(config.accessToken);

      case 'interactive': {
        const { client, server } = config;
        // Interactive mode requires a local server to receive the OAuth redirect
        if (!server) {
          throw new Error('Server configuration is required for interactive mode');
        }
        return new AuthProviderInteractive(client, { server });
      }

      case 'device_code': {
        const { client, deviceCodeCallback } = config;
        return new AuthProviderDeviceCode(client, { deviceCodeCallback });
      }

      default:
        return new AuthProvider(config.client);
    }
  },
  postInitialize: async ({ instance, modules }) => {
    // A static token involves no acquisition and must never be observed. The prototype check
    // is deliberate: provider `instanceof` is duck-typed and matches every module provider.
    if (!Object.prototype.isPrototypeOf.call(AuthTokenProvider.prototype, instance)) {
      telemetryConnections.set(instance, connectAuthTelemetry(instance, modules.telemetry));
    }
  },
  dispose: ({ instance }) => {
    // Only telemetry is detached; provider disposal itself is unchanged.
    telemetryConnections.get(instance)?.();
    telemetryConnections.delete(instance);
  },
};

export default module;
