import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { enableAzureIdentityAuth } from './enable-azure-identity-auth.js';

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
