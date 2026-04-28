import { DefaultAzureCredential } from '@azure/identity';
import { useIdentityPlugin } from '@azure/identity';
import { cachePersistencePlugin } from '@azure/identity-cache-persistence';
import type { IAuthProvider } from './AuthProvider.interface.js';

// Register the persistence plugin once at module load so that all
// Azure Identity credentials (DefaultAzureCredential, InteractiveBrowserCredential)
// can use encrypted OS-level token caching (Keychain on macOS, DPAPI on Windows,
// libsecret on Linux). Placed here because this module is always imported first
// via the barrel export, ensuring the plugin is available before any credential
// is constructed.
useIdentityPlugin(cachePersistencePlugin);

/**
 * Authentication provider backed by Azure Identity's `DefaultAzureCredential`.
 *
 * Acquires tokens through the standard credential chain:
 * environment variables, workload identity, managed identity, Azure CLI, etc.
 *
 * Ideal for CI/CD workflows where `azure/login` has established OIDC federation,
 * or for services running with a managed identity.
 *
 * Login and logout are not applicable — credentials come from the ambient
 * environment.
 *
 * @example
 * ```typescript
 * enableAzureIdentityAuth(configurator);
 * // framework.auth.acquireAccessToken({ request: { scopes } });
 * ```
 */
export class AuthProviderDefaultCredential implements IAuthProvider {
  readonly #credential: DefaultAzureCredential;

  constructor() {
    this.#credential = new DefaultAzureCredential();
  }

  /**
   * Not supported — credentials are resolved from the environment.
   * @throws {Error} Always.
   */
  login(_options: { request: { scopes: string[] } }): Promise<never> {
    throw new Error('Login is not supported in default_credential mode');
  }

  /**
   * Not supported — there is no session to clear.
   * @throws {Error} Always.
   */
  logout(): Promise<never> {
    throw new Error('Logout is not supported in default_credential mode');
  }

  /**
   * Acquires an access token using the `DefaultAzureCredential` chain.
   *
   * @param options - An object containing the scopes to request.
   * @returns The access token string.
   * @throws {Error} When no credential source is available or token acquisition fails.
   */
  async acquireAccessToken(options: { request: { scopes: string[] } }): Promise<string> {
    const tokenResponse = await this.#credential.getToken(options.request.scopes);
    if (!tokenResponse) {
      throw new Error(
        'DefaultAzureCredential returned no token. Verify that Azure credentials are available in the environment.',
      );
    }
    return tokenResponse.token;
  }
}

export default AuthProviderDefaultCredential;
