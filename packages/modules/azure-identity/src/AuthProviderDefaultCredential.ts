import { DefaultAzureCredential } from '@azure/identity';
import type { IAuthProvider } from './AuthProvider.interface.js';
import { NoCredentialError } from './errors.js';

let pluginRegistered = false;

/**
 * Lazily registers the Azure Identity cache persistence plugin on first use.
 *
 * Deferred to avoid loading `keytar` (a native C++ addon) at import time,
 * which would fail in CI environments where the prebuilt binary is unavailable
 * (e.g. `ERR_DLOPEN_FAILED`). The plugin is registered once before any
 * credential is constructed.
 */
export async function ensureCachePersistencePlugin(): Promise<void> {
  if (pluginRegistered) return;
  const { useIdentityPlugin } = await import('@azure/identity');
  const { cachePersistencePlugin } = await import('@azure/identity-cache-persistence');
  useIdentityPlugin(cachePersistencePlugin);
  pluginRegistered = true;
}

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
  async login(_options: { request: { scopes: string[] } }): Promise<never> {
    throw new Error('Login is not supported in default_credential mode');
  }

  /**
   * Not supported — there is no session to clear.
   * @throws {Error} Always.
   */
  async logout(): Promise<never> {
    throw new Error('Logout is not supported in default_credential mode');
  }

  /**
   * Acquires a token result with expiry metadata using the `DefaultAzureCredential` chain.
   *
   * @param options - An object containing the scopes to request.
   * @returns The token result including access token and expiry.
   * @throws {NoCredentialError} When no credential source is available or token acquisition fails.
   */
  async acquireToken(options: { request: { scopes: string[] } }): Promise<{ accessToken: string; expiresOn: Date | null } | null> {
    const tokenResponse = await this.#credential.getToken(options.request.scopes);
    if (!tokenResponse) {
      throw new NoCredentialError(
        'DefaultAzureCredential returned no token. Verify that Azure credentials are available in the environment.',
      );
    }
    return {
      accessToken: tokenResponse.token,
      expiresOn: new Date(tokenResponse.expiresOnTimestamp),
    };
  }

  /**
   * Acquires an access token using the `DefaultAzureCredential` chain.
   *
   * @param options - An object containing the scopes to request.
   * @returns The access token string.
   * @throws {NoCredentialError} When no credential source is available or token acquisition fails.
   */
  async acquireAccessToken(options: { request: { scopes: string[] } }): Promise<string> {
    const result = await this.acquireToken(options);
    if (!result) {
      throw new NoCredentialError(
        'DefaultAzureCredential returned no token. Verify that Azure credentials are available in the environment.',
      );
    }
    return result.accessToken;
  }
}

export default AuthProviderDefaultCredential;
