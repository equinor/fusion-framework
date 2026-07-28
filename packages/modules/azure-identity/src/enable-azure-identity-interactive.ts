import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { InteractiveAuthOptions } from './configurator.js';
import { enableAzureIdentityAuth } from './enable-azure-identity-auth.js';

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
