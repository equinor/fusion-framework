import type { PopupRequest, RedirectRequest } from '@azure/msal-browser';

const STORAGE_PREFIX = 'fusion.msal.token-redirect.';

/**
 * Tracks automatic token redirects in the current tab, including across reloads.
 * Only a successful token acquisition resets an attempt; explicit retries bypass reservation.
 * Request identity is hashed so claims and account details are not stored in guard keys.
 */
export class TokenRedirectGuard {
  #clientId: string;
  #authority: string;

  /**
   * Creates a guard isolated to an application and its default authority.
   * @param clientId - Entra application ID
   * @param authority - Default authority used when the request has no override
   */
  constructor(clientId: string, authority: string) {
    this.#clientId = clientId;
    this.#authority = authority;
  }

  /**
   * Derives a stable identity without telemetry IDs, nonce, navigation state or cache policy.
   * @param request - Token request whose authorization requirements identify an attempt
   * @returns Hashed session-storage key
   */
  async #key(request: PopupRequest | RedirectRequest): Promise<string> {
    // Scope order, casing and duplicates do not change MSAL's token cache identity.
    const scopes = [...new Set(request.scopes.map((scope) => scope.toLowerCase()))].sort();
    const identity = JSON.stringify([
      this.#clientId,
      (request.authority ?? this.#authority).replace(/\/+$/, '').toLowerCase(),
      request.account?.homeAccountId,
      request.account?.localAccountId,
      request.account?.tenantId,
      request.account?.environment,
      scopes,
      request.claims,
      request.authenticationScheme ?? 'Bearer',
      request.resource,
      request.resourceRequestMethod,
      request.resourceRequestUri,
      request.sshKid,
      request.sshJwk,
      request.popKid,
      request.embeddedClientId,
      request.loginHint,
      request.sid,
      request.domainHint,
      request.prompt,
      request.redirectUri,
      request.extraScopesToConsent?.slice().sort(),
      // Sort parameter maps so caller insertion order cannot bypass the guard.
      Object.entries(request.extraQueryParameters ?? {}).sort(),
      Object.entries(request.extraParameters ?? {}).sort(),
    ]);
    const digest = await globalThis.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(identity),
    );
    return (
      STORAGE_PREFIX +
      Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
    );
  }

  /**
   * Reserves an automatic redirect before navigation or any asynchronous MSAL work.
   * @param request - Token request to reserve
   * @returns True for the first attempt; false if already attempted in this tab
   * @throws {Error} If browser storage or request hashing is unavailable
   */
  async reserve(request: PopupRequest | RedirectRequest): Promise<boolean> {
    try {
      const key = await this.#key(request);
      // Keep check and write synchronous to prevent concurrent clients reserving the same redirect.
      if (globalThis.sessionStorage.getItem(key) !== null) {
        return false;
      }
      globalThis.sessionStorage.setItem(key, 'attempted');
      return true;
    } catch (cause) {
      throw new Error(
        'Cannot safely start automatic MSAL redirect: redirect guard storage or hashing is unavailable.',
        { cause },
      );
    }
  }

  /**
   * Clears a completed request or a redirect that failed before navigation.
   * @param request - Exact token request to clear (other accounts/scopes remain guarded)
   * @throws {Error} If browser storage or request hashing is unavailable
   */
  async clear(request: PopupRequest | RedirectRequest): Promise<void> {
    try {
      const key = await this.#key(request);
      globalThis.sessionStorage.removeItem(key);
    } catch (cause) {
      throw new Error('Cannot clear MSAL token redirect guard storage.', { cause });
    }
  }
}
