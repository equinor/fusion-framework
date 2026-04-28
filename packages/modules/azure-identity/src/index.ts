/**
 * `@equinor/fusion-framework-module-azure-identity` provides Azure AD authentication
 * for Node.js applications using `@azure/identity` credentials.
 *
 * Supports three modes:
 *
 * - **`default_credential`** — `DefaultAzureCredential` for CI/CD, managed identity,
 *   Azure CLI, and other ambient credential sources.
 * - **`interactive`** — `InteractiveBrowserCredential` for browser-based login with
 *   OS-level token caching (Keychain / DPAPI / libsecret).
 * - **`token_only`** — static access token supplied externally.
 *
 * Registers under the `'auth'` module slot as a drop-in replacement for the
 * MSAL Node module.
 *
 * @example
 * ```typescript
 * import { enableAzureIdentityAuth } from '@equinor/fusion-framework-module-azure-identity';
 *
 * // Default credential (CI/CD, managed identity)
 * enableAzureIdentityAuth(configurator);
 *
 * // Interactive browser login
 * enableAzureIdentityAuth(configurator, (builder) => {
 *   builder.setInteractive({ tenantId, clientId, redirectPort: 49741 });
 * });
 * ```
 *
 * @packageDocumentation
 */

export { AuthProviderDefaultCredential } from './AuthProviderDefaultCredential.js';
export { AuthProviderInteractiveBrowser } from './AuthProviderInteractiveBrowser.js';
export { AuthProviderTokenOnly } from './AuthProviderTokenOnly.js';
export { NoCredentialError } from './errors.js';

export type { IAuthProvider } from './AuthProvider.interface.js';
export type { AzureIdentityAuthConfig, InteractiveAuthOptions } from './configurator.js';
export { AzureIdentityAuthConfigurator } from './configurator.js';

export { module as azureIdentityModule, type AzureIdentityModule } from './module.js';

export {
  enableAzureIdentityAuth,
  enableAzureIdentityDefaultCredential,
  enableAzureIdentityInteractive,
  enableAzureIdentityTokenOnly,
} from './enable-module.js';
