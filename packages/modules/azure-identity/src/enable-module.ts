import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { module } from './module.js';
import type { AzureIdentityAuthConfigurator } from './configurator.js';
import type { InteractiveAuthOptions } from './configurator.js';

/**
 * Enables the Azure Identity auth module on a Fusion Framework configurator.
 *
 * Registers the auth module under the `'auth'` slot — the same slot used by
 * the MSAL Node module. Only one auth module can be active at a time.
 *
 * @param configurator - The modules configurator to register the module with.
 * @param configure - Optional callback to set mode, credentials, and options
 *   on the {@link AzureIdentityAuthConfigurator}. When omitted the module
 *   defaults to `default_credential` mode.
 *
 * @example Default credential (CI/CD, managed identity)
 * ```typescript
 * enableAzureIdentityAuth(configurator);
 * ```
 *
 * @example Interactive browser login
 * ```typescript
 * enableAzureIdentityAuth(configurator, (builder) => {
 *   builder.setInteractive({ tenantId, clientId, redirectPort: 49741 });
 * });
 * ```
 *
 * @example Static token
 * ```typescript
 * enableAzureIdentityAuth(configurator, (builder) => {
 *   builder.setTokenOnly(token);
 * });
 * ```
 *
 * @example Full config object
 * ```typescript
 * enableAzureIdentityAuth(configurator, (builder) => {
 *   builder.setConfig({ mode: 'interactive', tenantId, clientId, redirectPort: 49741 });
 * });
 * ```
 */
export const enableAzureIdentityAuth = (
  // biome-ignore lint/suspicious/noExplicitAny: module configurator accepts any module set
  configurator: IModulesConfigurator<any, any>,
  configure?: (builder: AzureIdentityAuthConfigurator) => void,
): void => {
  configurator.addConfig({
    module,
    configure: (builder) => {
      if (configure) {
        configure(builder);
      } else {
        // Default to ambient credential resolution
        builder.setDefaultCredential();
      }
    },
  });
};

/**
 * Enables Azure Identity auth in `default_credential` mode.
 *
 * Uses the `DefaultAzureCredential` chain: environment variables, workload
 * identity, managed identity, Azure CLI, etc.
 *
 * @param configurator - The modules configurator to register the module with.
 *
 * @example
 * ```typescript
 * enableAzureIdentityDefaultCredential(configurator);
 * ```
 */
export const enableAzureIdentityDefaultCredential = (
  // biome-ignore lint/suspicious/noExplicitAny: module configurator accepts any module set
  configurator: IModulesConfigurator<any, any>,
): void => {
  enableAzureIdentityAuth(configurator, (builder) => {
    builder.setDefaultCredential();
  });
};

/**
 * Enables Azure Identity auth in `interactive` mode with browser-based login
 * and OS-level token caching (Keychain / DPAPI / libsecret).
 *
 * @param configurator - The modules configurator to register the module with.
 * @param options - Tenant, client, redirect port, and optional browser callback.
 *
 * @example
 * ```typescript
 * enableAzureIdentityInteractive(configurator, {
 *   tenantId: '3aa4a235-...',
 *   clientId: 'a318b8e1-...',
 *   redirectPort: 49741,
 *   onOpen: (url) => open(url),
 * });
 * ```
 */
export const enableAzureIdentityInteractive = (
  // biome-ignore lint/suspicious/noExplicitAny: module configurator accepts any module set
  configurator: IModulesConfigurator<any, any>,
  options: InteractiveAuthOptions,
): void => {
  enableAzureIdentityAuth(configurator, (builder) => {
    builder.setInteractive(options);
  });
};

/**
 * Enables Azure Identity auth in `token_only` mode with a pre-obtained
 * static access token.
 *
 * @param configurator - The modules configurator to register the module with.
 * @param accessToken - The access token string.
 *
 * @example
 * ```typescript
 * enableAzureIdentityTokenOnly(configurator, process.env.FUSION_TOKEN);
 * ```
 */
export const enableAzureIdentityTokenOnly = (
  // biome-ignore lint/suspicious/noExplicitAny: module configurator accepts any module set
  configurator: IModulesConfigurator<any, any>,
  accessToken: string,
): void => {
  enableAzureIdentityAuth(configurator, (builder) => {
    builder.setTokenOnly(accessToken);
  });
};

export default enableAzureIdentityAuth;
