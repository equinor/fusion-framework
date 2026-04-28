/**
 * Minimal authentication record returned by {@link IAuthProvider.login}.
 *
 * Mirrors the subset of `AuthenticationRecord` from `@azure/identity` that
 * downstream consumers typically need, without coupling them to the Azure SDK.
 */
export interface AuthRecord {
  /** The authenticated user's UPN or email address. */
  readonly username: string;
  /** The Azure AD tenant that issued the credential. */
  readonly tenantId: string;
  /** The application (client) ID used for authentication. */
  readonly clientId: string;
  /** The authority URL (e.g. `https://login.microsoftonline.com/<tenantId>`). */
  readonly authority: string;
}

/**
 * Interface for authentication providers in the Fusion Framework.
 *
 * Provides a minimal contract for acquiring access tokens. Implementations may
 * support login/logout (interactive flows) or throw if those operations are not
 * applicable to the credential type.
 */
export interface IAuthProvider {
  /**
   * Initiates a login flow. Not supported by all credential types — implementations
   * that do not support user interaction should throw.
   *
   * @returns The authentication record from the completed flow.
   */
  login(options: { request: { scopes: string[] } }): Promise<AuthRecord>;

  /**
   * Clears any cached session. Not supported by all credential types — implementations
   * that have no session state should throw.
   */
  logout(): Promise<void>;

  /**
   * Acquires an access token for the specified scopes.
   *
   * @param options - The scopes to request.
   * @returns The access token string.
   */
  acquireAccessToken(options: {
    request: { scopes: string[] };
    interactive?: boolean;
  }): Promise<string>;
}
