import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';
import type { IAuthProvider } from './AuthProvider.interface.js';
import { version } from './version.js';

/**
 * Authentication provider that returns a static, pre-obtained access token.
 *
 * Used for CI/CD pipelines and automation where a token is supplied externally
 * (e.g. via `FUSION_TOKEN` environment variable). Login and logout are not
 * supported — the token is used as-is until it expires.
 *
 * Extends {@link BaseModuleProvider} so the module configurator recognises it as a
 * standard provider and can report the package `version`.
 */
export class AuthProviderTokenOnly extends BaseModuleProvider<undefined> implements IAuthProvider {
  readonly #accessToken: string;

  /**
   * Creates a provider that serves the given token for every request.
   *
   * @param token - The static access token to return from {@link acquireAccessToken}.
   */
  constructor(token: string) {
    // The token is kept private rather than passed as `config` so it is never exposed via the base class.
    super({ version, config: undefined });
    this.#accessToken = token;
  }

  /**
   * @param _options - Unused; login is not supported in token-only mode.
   * @returns Never resolves; always throws.
   * @throws Always — login is not supported with a static token.
   */
  async login(_options: { request: { scopes: string[] } }): Promise<never> {
    throw new Error('Login is not supported in token-only mode');
  }

  /**
   * @returns Never resolves; always throws.
   * @throws Always — logout is not supported with a static token.
   */
  async logout(): Promise<never> {
    throw new Error('Logout is not supported in token-only mode');
  }

  /**
   * Returns the pre-obtained token with no expiry metadata.
   *
   * @param _options - Ignored — the static token is returned regardless of scopes.
   * @returns The token result. `expiresOn` is `null` because the static token has no known expiry.
   */
  acquireToken(_options: {
    request: { scopes: string[] };
  }): Promise<{ accessToken: string; expiresOn: Date | null } | null> {
    return Promise.resolve({ accessToken: this.#accessToken, expiresOn: null });
  }

  /**
   * Returns the pre-obtained access token.
   *
   * @param _options - Ignored — the static token is returned regardless of scopes.
   * @returns The static access token string.
   */
  acquireAccessToken(_options: { request: { scopes: string[] } }): Promise<string> {
    return Promise.resolve(this.#accessToken);
  }
}
