import { PublicClientApplication } from '@azure/msal-node';
import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
  type ModulesInstance,
} from '@equinor/fusion-framework-module';

import type { MsalNodeModule } from './module.js';
import type { AuthConfig } from './AuthConfigurator.interface.js';

/**
 * Internal builder for MSAL Node authentication configuration.
 *
 * This class provides the implementation for the fluent API exposed via the public interface.
 * Most consumer-facing documentation is in the interface; see {@link IAuthConfigurator} for usage details.
 *
 * @see IAuthConfigurator
 * @extends BaseConfigBuilder
 *
 * Maintainers: Extend or refactor this class to support new authentication modes or configuration options.
 * Ensure changes are reflected in the interface and validated in `_processConfig`.
 */
export class AuthConfigurator extends BaseConfigBuilder<AuthConfig> {
  constructor() {
    super();
    this.setMode('interactive');
  }

  setMode(mode: AuthConfig['mode']) {
    this._set('mode', mode);
  }

  setClient(client: AuthConfig['client']) {
    this._set('client', client);
  }

  setClientConfig(tenantId: string, clientId: string): void {
    this._set('client', async () => {
      // Dynamically import the createAuthClient function since the client uses `libsecret``
      // which is not default installed in all environments.
      // This avoids installing `libsecret` in environments where it is not needed, like CI/CD pipelines.
      const { createAuthClient } = await import('./create-auth-client.js');
      return createAuthClient(tenantId, clientId);
    });
  }

  setServerPort(port: number) {
    this._set('server.port', port);
  }

  setServerOnOpen(onOpen: ((url: string) => void) | undefined) {
    this._set('server.onOpen', onOpen);
  }

  setAccessToken(token: string) {
    this._set('accessToken', token);
  }

  /**
   * Prepares and finalizes the authentication configuration before validation and use.
   *
   * This method injects the parent authentication provider reference (if available)
   * into the configuration. It is called before `_processConfig` and allows for
   * dynamic or contextual configuration adjustments based on the current module instance.
   *
   * Future maintainers: If additional contextual setup is needed (e.g., injecting
   * dependencies, environment-specific values, or chaining providers), extend this method.
   *
   * @inheritdoc
   * @param init - Initialization arguments, including module references.
   * @param initial - Optional initial configuration values.
   * @returns The prepared configuration object, ready for validation.
   */
  protected _buildConfig(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<AuthConfig> | undefined,
  ) {
    // Inject the parent auth provider from the current module instance, if present
    this._set('parent', (init.ref as ModulesInstance<[MsalNodeModule]>)?.auth);
    // Call the base builder to finalize the config
    return super._buildConfig(init, initial);
  }

  /**
   * Validates and processes the authentication configuration before use.
   *
   * This method ensures that all required properties are present and correctly typed
   * for the selected authentication mode. Throws descriptive errors if configuration
   * is incomplete or invalid, helping catch misconfigurations early.
   *
   * Future maintainers: Update this logic if new authentication modes or required
   * properties are introduced. Keep error messages clear to aid debugging.
   *
   * @inheritdoc
   * @param config - The authentication configuration object to validate.
   * @returns The validated configuration object.
   * @throws Error if required properties are missing or invalid for the selected mode.
   */
  async _processConfig(config: AuthConfig): Promise<AuthConfig> {
    switch (config.mode) {
      case 'interactive': {
        // Interactive mode requires a valid MSAL client instance
        if (config.client instanceof PublicClientApplication === false) {
          throw new Error('Client is required when mode is interactive');
        }
        // Server configuration must be present
        if (!config.server) {
          throw new Error('Server is required when mode is interactive');
        }
        // Server port must be a number
        if (typeof config.server.port !== 'number') {
          throw new Error('Server port must be a number when mode is interactive');
        }
        break;
      }
      case 'silent': {
        // Silent mode requires a valid MSAL client instance
        if (config.client instanceof PublicClientApplication === false) {
          throw new Error('Client is required when mode is silent');
        }
        break;
      }
      case 'token_only': {
        // Token only mode requires a string access token
        if (typeof config.accessToken !== 'string') {
          throw new Error('Access token is required when mode is token_only');
        }
        break;
      }
      // If new modes are added, ensure validation is implemented here
    }
    // Return the validated config for use by the module
    return config;
  }
}
