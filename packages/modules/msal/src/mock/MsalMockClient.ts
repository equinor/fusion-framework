import type {
  AccountInfo,
  AuthenticationResult,
  AuthorizationCodeRequest,
  PopupRequest,
  RedirectRequest,
  SilentRequest,
  SsoSilentRequest,
  EndSessionRequest,
  EndSessionPopupRequest,
  InitializeApplicationRequest,
  WrapperSKU,
  INavigationClient,
  BrowserConfiguration,
  Logger,
  PerformanceCallbackFunction,
  EventCallbackFunction,
  EventType,
  ClearCacheRequest,
} from '@azure/msal-browser';

import type {
  AcquireTokenOptions,
  AcquireTokenResult,
  IMsalClient,
  LoginOptions,
  LoginResult,
} from '../MsalClient.interface';
import type { MsalClientConfig, MsalClient } from '../MsalClient';

import { createMockToken } from './create-mock-token';
/**
 * The user a mock MSAL client signs in.
 *
 * @remarks
 * Deliberately separate from {@link MsalClientConfig}: a client is configured
 * with *what it talks to*, never with *who is signed in*. The real client learns
 * the user from Entra ID, so the mock is told after it is constructed — see
 * {@link MsalMockClient.setUser | setUser}.
 */
export interface MsalMockUser {
  /** Display name of the signed-in user. Defaults to `Test User`. */
  name?: string;
  /** UPN / email of the signed-in user. Defaults to `test.user@equinor.com`. */
  username?: string;
  /** Object ID of the signed-in user. Defaults to `fusion-mock-user`. */
  userId?: string;
  /** Tenant the user belongs to. Defaults to the client's configured tenant. */
  tenantId?: string;
  /** Scopes granted when a request does not specify its own. */
  scopes?: string[];
  /** Preconfigured account to use for signed-in state. */
  account?: AccountInfo;
  /**
   * Start without a signed-in user, while keeping this identity.
   *
   * @remarks
   * Silent flows then resolve empty so the provider follows its unauthenticated
   * path, while an explicit login still succeeds *as this user*. That lets a
   * test drive the sign-in journey and assert on who it ends up as, rather than
   * only on its end state.
   *
   * Pass `null` instead of a user when the identity does not matter.
   */
  signedOut?: boolean;
}

/**
 * A stand-in for the MSAL client that resolves tokens in-process.
 *
 * @remarks
 * Constructed from {@link MsalClientConfig} — the very same argument
 * {@link MsalClient} takes — so it is a drop-in substitute rather than a second
 * API to learn. `setClientConfig` therefore means the same thing whether a test
 * runs against Entra ID or against this client.
 *
 * Only the boundary that would contact Entra ID is replaced. The real
 * `MsalProvider` runs on top of it unchanged, so account handling, silent-token
 * preference, scope resolution, proxy providers and telemetry behave as they do in
 * production — the test exercises the framework rather than the mock.
 *
 * Tokens are structurally valid, unsigned JWTs and are byte-identical between runs.
 * They are **not** cryptographically valid and are rejected by any real service.
 */
export class MsalMockClient implements IMsalClient {
  #user: Required<Pick<MsalMockUser, 'name' | 'username' | 'userId' | 'tenantId' | 'scopes'>> & {
    clientId: string;
  };
  #cache = new Map<string, AccountInfo>();
  #activeAccountId: string | null = null;

  /**
   * The account currently signed in, or `null`.
   *
   * @remarks
   * Reads through the cache rather than holding an account of its own, so an
   * account removed by a sign-out cannot linger as the active one.
   *
   * @returns The cached active account, or `null` when none is active.
   */
  get #account(): AccountInfo | null {
    return this.#activeAccountId ? (this.#cache.get(this.#activeAccountId) ?? null) : null;
  }

  /**
   * Signs an account in, adding it to the cache and making it active.
   *
   * @param account - The account to sign in.
   * @returns The signed-in account.
   */
  #signIn(account: AccountInfo): AccountInfo {
    this.#cache.set(account.homeAccountId, account);
    this.#activeAccountId = account.homeAccountId;
    return account;
  }

  /**
   * Signs the active account out, as MSAL does — the account leaves the cache.
   */
  #signOut(): void {
    // Only clear the cache entry when a session is active; this preserves an already signed-out state.
    if (this.#activeAccountId) {
      this.#cache.delete(this.#activeAccountId);
      this.#activeAccountId = null;
    }
  }

  /**
   * Mirrors MSAL's redirect completion, which is a no-op for this in-process mock.
   * @returns Always `null`, because the mock performs no redirect.
   */
  public async handleRedirectPromise(): Promise<AuthenticationResult | null> {
    return null;
  }

  /**
   * Mirrors silent SSO and returns a token for the cached mock account.
   * @param request - Silent SSO options and requested scopes.
   * @returns A mock authentication result.
   * @throws When no account is cached.
   */
  public async ssoSilent(request: SsoSilentRequest): Promise<AuthenticationResult> {
    // Silent SSO must fail without a session so providers exercise their login path.
    if (!this.#account) {
      throw new Error('MsalMockClient: no cached account for silent sign-in');
    }

    return this.#createResult(request.scopes);
  }

  /**
   * Mirrors popup login by signing in the configured mock user immediately.
   * @param request - Optional popup options and requested scopes.
   * @returns A mock authentication result.
   */
  public async loginPopup(request?: PopupRequest): Promise<AuthenticationResult> {
    this.#signIn(this.#createAccount());
    return this.#createResult(request?.scopes);
  }

  /**
   * Mirrors redirect login without navigating, because the mock has no browser boundary.
   * @param _request - Redirect options, accepted for interface compatibility.
   */
  public async loginRedirect(_request?: RedirectRequest): Promise<void> {
    this.#signIn(this.#createAccount());
  }

  /**
   * Mirrors the framework login entry point with an immediate mock sign-in.
   * @param options - Login options including the requested scopes.
   * @returns A mock login result.
   */
  public async login(options: LoginOptions): Promise<LoginResult> {
    this.#signIn(this.#createAccount());
    return this.#createResult((options.request as { scopes?: string[] })?.scopes);
  }

  /** Mirrors logout by removing the active mock account from the cache. */
  public async logout(): Promise<void> {
    this.#signOut();
  }

  /**
   * Mirrors MSAL initialization without performing a network handshake.
   * @param _request - Initialization options, accepted for interface compatibility.
   */
  public async initialize(_request?: InitializeApplicationRequest): Promise<void> {
    // No network handshake to perform
  }

  /**
   * Mirrors popup token acquisition using the mock login flow.
   * @param request - Popup token request.
   * @returns A mock authentication result.
   */
  public async acquireTokenPopup(request: PopupRequest): Promise<AuthenticationResult> {
    return this.loginPopup(request);
  }

  /**
   * Mirrors redirect token acquisition without browser navigation.
   * @param request - Redirect token request.
   */
  public async acquireTokenRedirect(request: RedirectRequest): Promise<void> {
    return this.loginRedirect(request);
  }

  /**
   * Mirrors silent token acquisition for the cached mock account.
   * @param request - Silent token request.
   * @returns A mock authentication result.
   * @throws When no account is cached.
   */
  public async acquireTokenSilent(request: SilentRequest): Promise<AuthenticationResult> {
    // Silent acquisition must fail without a session, matching the real MSAL boundary.
    if (!this.#account) {
      throw new Error('MsalMockClient: no cached account for silent sign-in');
    }
    return this.#createResult(request.scopes);
  }

  /**
   * Mirrors MSAL event registration; events are intentionally not emitted by the mock.
   * @param _callback - Event handler, accepted for interface compatibility.
   * @param _eventTypes - Event types, accepted for interface compatibility.
   * @returns Always `null`, because the mock registers no callback.
   */
  public addEventCallback(
    _callback: EventCallbackFunction,
    _eventTypes?: EventType[],
  ): string | null {
    return null;
  }

  /**
   * Mirrors event removal as a no-op because this mock registers no callbacks.
   * @param _callbackId - Callback identifier, accepted for interface compatibility.
   */
  public removeEventCallback(_callbackId: string): void {
    // No-op for mock
  }

  /**
   * Mirrors performance callback registration with a stable mock identifier.
   * @param _callback - Performance handler, accepted for interface compatibility.
   * @returns A stable mock callback identifier.
   */
  public addPerformanceCallback(_callback: PerformanceCallbackFunction): string {
    return 'mock-performance-callback';
  }

  /**
   * Mirrors performance callback removal and reports successful mock removal.
   * @param _callbackId - Callback identifier, accepted for interface compatibility.
   * @returns Always `true` because no callback state is retained.
   */
  public removePerformanceCallback(_callbackId: string): boolean {
    return true;
  }

  /**
   * Mirrors MSAL account lookup against the mock cache.
   * @param accountFilter - Account fields to match.
   * @returns The first matching account, or `null`.
   */
  public getAccount(accountFilter: unknown): AccountInfo | null {
    const filter = (accountFilter ?? {}) as Partial<
      Pick<AccountInfo, 'homeAccountId' | 'localAccountId' | 'username' | 'tenantId'>
    >;

    // Filter the cache so callers observe the same account-selection semantics as MSAL.
    const matches = this.getAllAccounts().filter(
      (account) =>
        (filter.homeAccountId === undefined || filter.homeAccountId === account.homeAccountId) &&
        (filter.localAccountId === undefined || filter.localAccountId === account.localAccountId) &&
        (filter.username === undefined || filter.username === account.username) &&
        (filter.tenantId === undefined || filter.tenantId === account.tenantId),
    );

    return matches[0] ?? null;
  }

  /**
   * Mirrors MSAL account enumeration using the mock cache.
   * @param _accountFilter - Account filter, accepted for interface compatibility.
   * @returns All accounts currently in the mock cache.
   */
  public getAllAccounts(_accountFilter?: unknown): AccountInfo[] {
    return [...this.#cache.values()];
  }

  /**
   * Mirrors redirect logout without navigating in the mock environment.
   * @param _request - Logout options, accepted for interface compatibility.
   */
  public async logoutRedirect(_request?: EndSessionRequest): Promise<void> {
    this.#signOut();
  }

  /**
   * Mirrors popup logout without opening a browser window.
   * @param _request - Logout options, accepted for interface compatibility.
   */
  public async logoutPopup(_request?: EndSessionPopupRequest): Promise<void> {
    this.#signOut();
  }

  /**
   * Mirrors MSAL logger access; the mock does not retain a logger.
   * @returns An interface-compatible empty logger value.
   */
  public getLogger(): Logger {
    // MSAL's Logger has a large internal surface with no mock consumers depend on; callers only pass it through
    return undefined as unknown as Logger;
  }

  /**
   * Mirrors logger configuration as a no-op for the mock.
   * @param _logger - Logger, accepted for interface compatibility.
   */
  public setLogger(_logger: unknown): void {
    // No-op for mock
  }

  /**
   * Mirrors wrapper metadata initialization as a no-op for the mock.
   * @param _sku - Wrapper identifier, accepted for interface compatibility.
   * @param _version - Wrapper version, accepted for interface compatibility.
   */
  public initializeWrapperLibrary(_sku: WrapperSKU, _version: string): void {
    // No-op for mock wrapper
  }

  /**
   * Mirrors navigation-client configuration as a no-op because no navigation occurs.
   * @param _navigationClient - Navigation client, accepted for interface compatibility.
   */
  public setNavigationClient(_navigationClient: INavigationClient): void {
    // No-op for mock
  }

  /**
   * Mirrors configuration access and rejects it because the mock has no browser config.
   * @returns Never; this mock does not expose browser configuration.
   * @throws Always, because browser configuration is unsupported.
   */
  public getConfiguration(): BrowserConfiguration {
    throw new Error('MsalMockClient: getConfiguration is not supported in the mock client');
  }

  /**
   * Mirrors cache hydration as a no-op because mock tokens are created in-process.
   * @param _result - Authentication result, accepted for interface compatibility.
   * @param _request - Original token request, accepted for interface compatibility.
   */
  public async hydrateCache(
    _result: AuthenticationResult,
    _request: SilentRequest | SsoSilentRequest | RedirectRequest | PopupRequest,
  ): Promise<void> {
    // No-op for mock
  }

  /**
   * Mirrors MSAL cache clearing by removing every mock account.
   * @param _request - Cache-clear options, accepted for interface compatibility.
   */
  public async clearCache(_request?: ClearCacheRequest): Promise<void> {
    this.#cache.clear();
    this.#activeAccountId = null;
  }

  /**
   * Mirrors the generic token acquisition entry point for the active mock account.
   * @param options - Token acquisition options.
   * @returns A mock result, or `null` without an active account.
   */
  public async acquireToken(options: AcquireTokenOptions): Promise<AcquireTokenResult> {
    // Generic acquisition returns no result when no account is active, matching MSAL's nullable result.
    if (!this.#account) {
      return null;
    }
    return this.#createResult(options.request?.scopes);
  }

  /**
   * Mirrors authorization-code exchange by signing in and returning a mock result.
   * @param request - Authorization-code request.
   * @returns A mock authentication result.
   */
  public async acquireTokenByCode(
    request: AuthorizationCodeRequest,
  ): Promise<AuthenticationResult> {
    this.#signIn(this.#createAccount());
    return this.#createResult((request as { scopes?: string[] })?.scopes);
  }

  /**
   * Creates a mock client for the services the given configuration points at.
   *
   * @remarks
   * Takes the same argument as {@link MsalClient}. A user named `Test User` is
   * already in the account cache, so a provider built on this client boots the
   * way one does for a returning user with a live session — no sign-in runs, and
   * the provider's start-up path sees the state it would see in production. Use
   * {@link MsalMockClient.setUser | setUser} to say who that user is.
   *
   * @param config - The same client configuration the real client is built from.
   */
  public constructor(config: MsalClientConfig) {
    const tenantId = config.auth.tenantId ?? MsalMockClient.#tenantFromAuthority(config.auth);

    this.#user = {
      name: 'Test User',
      username: 'test.user@equinor.com',
      userId: 'fusion-mock-user',
      tenantId: tenantId ?? 'fusion-mock-tenant',
      scopes: ['fusion-mock-scope'],
      clientId: config.auth.clientId,
    };

    this.#signIn(this.#createAccount());
  }

  /**
   * Reads the tenant out of an authority URL.
   *
   * @remarks
   * A configuration may carry only `authority`, in which case the tenant still
   * has to end up on the tokens this client mints for the account to look like
   * the one a real sign-in would have produced.
   *
   * @param auth - The auth section of the client configuration.
   * @returns The tenant, or `undefined` when the authority carries none.
   */
  static #tenantFromAuthority(auth: MsalClientConfig['auth']): string | undefined {
    // An explicit tenant takes precedence; only parse authority when configuration omitted it.
    if (!auth.authority) {
      return undefined;
    }

    try {
      // Remove empty URL path segments to identify the authority's tenant consistently.
      const segments = new URL(auth.authority).pathname.split('/').filter(Boolean);
      return segments.at(-1);
    } catch {
      return undefined;
    }
  }

  /**
   * Returns the client identifier used by tokens minted by this mock.
   * @returns The configured client identifier.
   */
  public get clientId(): string | undefined {
    return this.#user.clientId;
  }

  /**
   * Returns the tenant identifier used by tokens minted by this mock.
   * @returns The configured tenant identifier.
   */
  public get tenantId(): string | undefined {
    return this.#user.tenantId;
  }

  /**
   * Reports whether the mock currently has an active account.
   * @returns Whether an account is active.
   */
  public get hasValidClaims(): boolean {
    return this.#account !== null;
  }

  /**
   * Mirrors MSAL active-account access using the mock's single active account.
   * @returns The active account, or `null`.
   */
  public getActiveAccount(): AccountInfo | null {
    return this.#account;
  }

  /**
   * Makes an account the active one, adding it to the cache if it is unknown.
   *
   * @remarks
   * Real MSAL requires the account to already be cached. Accepting an unknown
   * one is a deliberate concession to tests: it is the shortest way to swap the
   * signed-in user between runs, without reconstructing the framework.
   *
   * @param next - The account to make active, or `null` to sign out.
   */
  public setActiveAccount(next: AccountInfo | null): void {
    // A null account is the MSAL sign-out signal, so clear the active mock session.
    if (!next) {
      this.#signOut();
      return;
    }

    this.#signIn(next);
  }

  /**
   * Declares who is signed in, replacing whoever was.
   *
   * @remarks
   * This is the counterpart to a real sign-in: the client is configured with
   * what it talks to, and learns the user separately. `MsalMockConfigurator`
   * applies it as the configuration is assembled, so the account is in the cache
   * before `MsalProvider.initialize` runs — the provider then behaves as it does
   * for a returning user with a live session.
   *
   * Values left out keep whatever they were. Passing `null` signs out and
   * forgets the identity, so the provider follows its unauthenticated path;
   * `{ signedOut: true }` does the same but keeps the identity, so a later login
   * resolves as that user.
   *
   * @param user - The user to sign in, or `null` when nobody is.
   */
  public setUser(user: MsalMockUser | null): void {
    // Declaring a user replaces the session rather than adding to it, so a test
    // that names a second user does not silently end up with two cached accounts
    this.#cache.clear();
    this.#activeAccountId = null;

    // A null user explicitly clears the session and identity supplied to the mock.
    if (!user) {
      return;
    }

    const { account, signedOut, ...rest } = user;

    // Merge overrides while retaining defaults for fields omitted by the test.
    this.#user = {
      ...this.#user,
      ...rest,
      name: rest.name ?? account?.name ?? this.#user.name,
      username: rest.username ?? account?.username ?? this.#user.username,
      userId: rest.userId ?? account?.localAccountId ?? this.#user.userId,
      tenantId: rest.tenantId ?? account?.tenantId ?? this.#user.tenantId,
      scopes: rest.scopes ?? this.#user.scopes,
    };

    // Keep identity data without caching an account when the test starts signed out.
    if (signedOut) {
      return;
    }

    this.#signIn(account ?? this.#createAccount());
  }

  /**
   * Creates the one account represented by this mock's configured identity.
   * @returns An MSAL-shaped account for the configured user.
   */
  #createAccount(): AccountInfo {
    return {
      homeAccountId: `${this.#user.userId}.${this.#user.tenantId}`,
      localAccountId: this.#user.userId,
      environment: 'login.microsoftonline.com',
      tenantId: this.#user.tenantId,
      username: this.#user.username,
      name: this.#user.name,
    } as AccountInfo;
  }

  /**
   * Creates an MSAL-shaped token result for the requested or default scopes.
   * @param scopes - Requested scopes, or the user's configured defaults.
   * @returns An MSAL-shaped mock authentication result.
   */
  #createResult(scopes?: string[]): AuthenticationResult {
    const granted = scopes?.length ? scopes : this.#user.scopes;
    const token = createMockToken({
      name: this.#user.name,
      preferred_username: this.#user.username,
      oid: this.#user.userId,
      tid: this.#user.tenantId,
      aud: this.#user.clientId,
      scp: granted.join(' '),
    });

    // Object shape matches AuthenticationResult's fields consumers rely on; the real
    // type also carries browser-only fields (e.g. `familyId`) this mock intentionally omits
    return {
      account: this.#account ?? this.#createAccount(),
      accessToken: token,
      idToken: token,
      scopes: granted,
      tokenType: 'Bearer',
      expiresOn: new Date('2033-11-14T22:13:20.000Z'),
      authority: `https://login.microsoftonline.com/${this.#user.tenantId}`,
      uniqueId: this.#user.userId,
      tenantId: this.#user.tenantId,
      fromCache: false,
      correlationId: 'fusion-mock-correlation',
    } as unknown as AuthenticationResult;
  }
}
