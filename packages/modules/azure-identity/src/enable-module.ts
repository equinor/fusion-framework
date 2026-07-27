import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { module } from './module.js';
import type { AzureIdentityAuthConfigurator } from './configurator.js';

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
      // Fall back to ambient credential resolution when no callback is supplied
      if (configure) {
        configure(builder);
      } else {
        // Default to ambient credential resolution
        builder.setDefaultCredential();
      }
    },
  });
};

export default enableAzureIdentityAuth;
