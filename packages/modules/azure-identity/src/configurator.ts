import {
  BaseConfigBuilder,
  type ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';

/**
 * Discriminated union of Azure Identity auth configurations.
 *
 * - `default_credential` — ambient environment (CI/CD, managed identity, Azure CLI).
 * - `interactive` — opens browser for user login, caches tokens to OS keychain.
 * - `token_only` — uses a pre-obtained static access token.
 */
export type AzureIdentityAuthConfig =
  | { mode: 'default_credential' }
  | {
      mode: 'interactive';
      tenantId: string;
      clientId: string;
      redirectPort: number;
      onOpen?: (url: string) => void;
    }
  | { mode: 'token_only'; accessToken: string };

/**
 * Configuration options for the interactive browser authentication mode.
 *
 * Shared by the configurator setters and the `AuthProviderInteractiveBrowser`
 * factory — this is the single definition for interactive-mode parameters.
 *
 * @see {@link AzureIdentityAuthConfigurator.setInteractive}
 */
export interface InteractiveAuthOptions {
  /** Azure AD tenant (directory) ID. */
  tenantId: string;
  /** Azure AD application (client) ID. */
  clientId: string;
  /** Port for the localhost redirect URI used during the auth code flow. */
  redirectPort: number;
  /** Callback invoked with the login URI once the interactive flow starts. */
  onOpen?: (url: string) => void;
}

/**
 * Configurator for the Azure Identity auth module.
 *
 * Provides type-safe setters for each authentication mode. Each setter
 * requires exactly the options needed for that mode, preventing
 * misconfiguration at compile time.
 *
 * Defaults to `default_credential` when no mode is configured.
 *
 * @example Set a complete config object directly
 * ```typescript
 * builder.setConfig({
 *   mode: 'interactive',
 *   tenantId: '3aa4a235-...',
 *   clientId: 'a318b8e1-...',
 *   redirectPort: 49741,
 * });
 * ```
 *
 * @example Use mode-specific setters
 * ```typescript
 * builder.setInteractive({
 *   tenantId: '3aa4a235-...',
 *   clientId: 'a318b8e1-...',
 *   redirectPort: 49741,
 *   onOpen: (url) => open(url),
 * });
 * ```
 */
export class AzureIdentityAuthConfigurator extends BaseConfigBuilder<AzureIdentityAuthConfig> {
  /**
   * Sets the full configuration object directly.
   *
   * The discriminated union ensures the correct shape for each mode.
   *
   * @param config - A complete {@link AzureIdentityAuthConfig} object.
   *
   * @example
   * ```typescript
   * builder.setConfig({ mode: 'default_credential' });
   * builder.setConfig({ mode: 'token_only', accessToken: '...' });
   * builder.setConfig({ mode: 'interactive', tenantId, clientId, redirectPort: 49741 });
   * ```
   */
  setConfig(config: AzureIdentityAuthConfig): void {
    this._set('mode', config.mode);
    switch (config.mode) {
      case 'interactive':
        this._set('tenantId', config.tenantId);
        this._set('clientId', config.clientId);
        this._set('redirectPort', config.redirectPort);
        this._set('onOpen', config.onOpen);
        break;
      case 'token_only':
        this._set('accessToken', config.accessToken);
        break;
    }
  }

  /**
   * Configures `default_credential` mode using `DefaultAzureCredential`.
   *
   * Uses the ambient credential chain: environment variables, workload identity,
   * managed identity, Azure CLI, etc.
   */
  setDefaultCredential(): void {
    this._set('mode', 'default_credential');
  }

  /**
   * Configures `interactive` mode with browser-based login and OS-level
   * token caching.
   *
   * @param options - Tenant, client, redirect port, and optional browser callback.
   *
   * @example
   * ```typescript
   * builder.setInteractive({
   *   tenantId: '3aa4a235-...',
   *   clientId: 'a318b8e1-...',
   *   redirectPort: 49741,
   * });
   * ```
   */
  setInteractive(options: InteractiveAuthOptions): void {
    this._set('mode', 'interactive');
    this._set('tenantId', options.tenantId);
    this._set('clientId', options.clientId);
    this._set('redirectPort', options.redirectPort);
    this._set('onOpen', options.onOpen);
  }

  /**
   * Configures `token_only` mode with a pre-obtained static access token.
   *
   * @param accessToken - The access token string.
   *
   * @example
   * ```typescript
   * builder.setTokenOnly(process.env.FUSION_TOKEN);
   * ```
   */
  setTokenOnly(accessToken: string): void {
    this._set('mode', 'token_only');
    this._set('accessToken', accessToken);
  }

  protected override _buildConfig(
    init: ConfigBuilderCallbackArgs,
    initial?: Partial<AzureIdentityAuthConfig>,
  ) {
    return super._buildConfig(init, initial);
  }
}
