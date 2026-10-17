import { DefaultAzureCredential } from '@azure/identity';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { IAuthProvider } from './AuthProvider.interface.js';
import { NoCredentialError } from './NoCredentialError.js';
import { version } from './version.js';

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
 *
 * Extends {@link BaseModuleProvider} so the module configurator recognises it as a
 * standard provider and can report the package `version`.
 */
export class AuthProviderDefaultCredential
  extends BaseModuleProvider<undefined>
  implements IAuthProvider
{
  readonly #credential: DefaultAzureCredential;

  /**
   * Creates the provider, initializing the underlying `DefaultAzureCredential` chain.
   */
  constructor() {
    super({ version, config: undefined });
    this.#credential = new DefaultAzureCredential();
  }

  /**
   * Not supported — credentials are resolved from the environment.
   * @param _options - Unused; login is not supported in this mode.
   * @returns Never resolves; always throws.
   * @throws {Error} Always.
   */
  async login(_options: { request: { scopes: string[] } }): Promise<never> {
    throw new Error('Login is not supported in default_credential mode');
  }

  /**
   * Not supported — there is no session to clear.
   * @returns Never resolves; always throws.
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
  async acquireToken(options: {
    request: { scopes: string[] };
  }): Promise<{ accessToken: string; expiresOn: Date | null } | null> {
    const tokenResponse = await this.#credential.getToken(options.request.scopes);
    // The credential chain resolved but returned no usable token
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
    // acquireToken returns null when the credential chain yields no token
    if (!result) {
      throw new NoCredentialError(
        'DefaultAzureCredential returned no token. Verify that Azure credentials are available in the environment.',
      );
    }
    return result.accessToken;
  }
}

export default AuthProviderDefaultCredential;
