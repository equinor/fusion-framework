import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { enableAzureIdentityAuth } from './enable-azure-identity-auth.js';

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
