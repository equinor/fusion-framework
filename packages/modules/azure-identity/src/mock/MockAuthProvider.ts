import type { AuthRecord, IAuthProvider } from '../AuthProvider.interface.js';

/**
 * The identity {@link MockAuthProvider} signs in by default, and returns to
 * when {@link MockAuthProvider.setAccount | setAccount} has not overridden it.
 */
const defaultAccount: AuthRecord = {
  username: 'test.user@equinor.com',
  tenantId: 'fusion-mock-tenant',
  clientId: 'fusion-mock-client',
  authority: 'https://login.microsoftonline.com/fusion-mock-tenant',
};

/**
 * Options for constructing a {@link MockAuthProvider}.
 */
export interface MockAuthProviderOptions {
  /** Fields to merge onto the default identity (`test.user@equinor.com`). */
  account?: Partial<AuthRecord>;
  /**
   * Start without a signed-in session, while keeping the identity above.
   *
   * @remarks
   * `acquireToken`/`acquireAccessToken` then throw until a test calls
   * {@link MockAuthProvider.login | login}, which succeeds as that identity —
   * this lets a test drive the sign-in journey rather than assert only on an
   * already-signed-in end state.
   */
  signedOut?: boolean;
  /** Access token returned by {@link MockAuthProvider.acquireToken | acquireToken}. Defaults to a fixed placeholder string. */
  accessToken?: string;
  /** Expiry reported by {@link MockAuthProvider.acquireToken | acquireToken}. Defaults to `null` (no known expiry), matching {@link AuthProviderTokenOnly}. */
  expiresOn?: Date | null;
}

/**
 * Configurable {@link IAuthProvider} test double for the `'auth'` module slot.
 *
 * @remarks
 * Unlike `AuthProviderTokenOnly`'s single fixed token, `login`/`logout` actually
 * change state here: a test can drive the provider from signed-out to signed-in
 * (and back), and control the token and expiry `acquireToken` returns afterwards
 * — including an expiry in the past, to exercise a consuming application's own
 * refresh logic.
 *
 * No network calls are made; nothing here talks to Entra ID or `@azure/identity`.
 *
 * @example Default identity, already signed in
 * ```typescript
 * import { enableAuthMock } from '@equinor/fusion-framework-module-azure-identity/mock';
 *
 * const auth = enableAuthMock(configurator);
 * await auth.acquireAccessToken({ request: { scopes: ['User.Read'] } }); // resolves
 * ```
 *
 * @example Start signed out, then log in
 * ```typescript
 * const auth = enableAuthMock(configurator, (auth) => auth.setAccount({ signedOut: true }));
 * await expect(auth.acquireAccessToken({ request: { scopes } })).rejects.toThrow();
 *
 * await auth.login({ request: { scopes } });
 * await auth.acquireAccessToken({ request: { scopes } }); // now resolves
 * ```
 *
 * @example Simulate an expired token
 * ```typescript
 * auth.setExpiresOn(new Date(Date.now() - 1000));
 * const { expiresOn } = (await auth.acquireToken({ request: { scopes } }))!;
 * expiresOn!.getTime() < Date.now(); // true — a refresh path under test now has something to react to
 * ```
 */
export class MockAuthProvider implements IAuthProvider {
  #identity: AuthRecord;
  #signedIn: boolean;
  #accessToken: string;
  #expiresOn: Date | null;

  /**
   * @param options - The identity, initial signed-in state, token, and expiry to configure.
   */
  constructor(options: MockAuthProviderOptions = {}) {
    // `options.account` only overrides the fields a test names, keeping the rest of the default identity
    this.#identity = { ...defaultAccount, ...options.account };
    this.#signedIn = !options.signedOut;
    this.#accessToken = options.accessToken ?? 'fusion-mock-access-token';
    this.#expiresOn = options.expiresOn ?? null;
  }

  /**
   * Signs the configured identity in.
   *
   * Unlike `AuthProviderTokenOnly.login`, this succeeds — moving the provider
   * into a signed-in state so subsequent `acquireToken`/`acquireAccessToken`
   * calls resolve.
   *
   * @param _options - Unused; the identity comes from the constructor or {@link setAccount}, not the login request.
   * @returns The signed-in {@link AuthRecord}.
   */
  async login(_options: { request: { scopes: string[] } }): Promise<AuthRecord> {
    this.#signedIn = true;
    return this.#identity;
  }

  /**
   * Signs out, without discarding the configured identity — a later {@link login}
   * signs the same identity back in.
   */
  async logout(): Promise<void> {
    this.#signedIn = false;
  }

  /**
   * Returns the configured token and expiry for the signed-in identity.
   *
   * @param _options - Unused — the same token is returned regardless of scopes.
   * @returns The token result.
   * @throws When not signed in — call {@link login} first, or construct without `signedOut`.
   */
  async acquireToken(_options: {
    request: { scopes: string[] };
  }): Promise<{ accessToken: string; expiresOn: Date | null } | null> {
    // Mirrors a real provider's failure mode when there is no session to acquire a token for
    if (!this.#signedIn) {
      throw new Error(
        'MockAuthProvider: not signed in — call login() first, or construct without `signedOut`',
      );
    }
    return { accessToken: this.#accessToken, expiresOn: this.#expiresOn };
  }

  /**
   * Returns the configured access token for the signed-in identity.
   *
   * @param options - Unused — the same token is returned regardless of scopes.
   * @returns The access token string.
   * @throws When not signed in — call {@link login} first, or construct without `signedOut`.
   */
  async acquireAccessToken(options: {
    request: { scopes: string[] };
    interactive?: boolean;
  }): Promise<string> {
    // acquireToken never resolves `null` in this implementation — it throws instead when not signed in.
    const result = await this.acquireToken(options);
    // Unreachable today, kept for the `| null` contract acquireToken shares with a real provider
    if (!result) {
      throw new Error(
        'MockAuthProvider: not signed in — call login() first, or construct without `signedOut`',
      );
    }
    return result.accessToken;
  }

  /**
   * Replaces (parts of) the signed-in identity, and/or the signed-in state,
   * without going through {@link login}/{@link logout}.
   *
   * @param account - Fields to merge onto the current identity, plus an optional `signedOut` flag.
   * @returns `this`, for chaining.
   */
  setAccount(account: Partial<AuthRecord> & { signedOut?: boolean }): this {
    const { signedOut, ...identity } = account;
    // Only the fields the caller named are replaced; the rest of the current identity is kept
    this.#identity = { ...this.#identity, ...identity };
    // `undefined` means "leave the signed-in state as it is", distinct from explicitly passing `false`
    if (signedOut !== undefined) {
      this.#signedIn = !signedOut;
    }
    return this;
  }

  /**
   * Replaces the access token returned by {@link acquireToken}/{@link acquireAccessToken}.
   *
   * @param accessToken - The new access token string.
   * @returns `this`, for chaining.
   */
  setAccessToken(accessToken: string): this {
    this.#accessToken = accessToken;
    return this;
  }

  /**
   * Replaces the expiry reported by {@link acquireToken}.
   *
   * @param expiresOn - The new expiry, or `null` to report no known expiry.
   * @returns `this`, for chaining. Pass a date in the past to simulate an expired token.
   */
  setExpiresOn(expiresOn: Date | null): this {
    this.#expiresOn = expiresOn;
    return this;
  }
}
