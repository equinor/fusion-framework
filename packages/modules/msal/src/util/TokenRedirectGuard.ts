import type { PopupRequest, RedirectRequest } from '@azure/msal-browser';

const STORAGE_PREFIX = 'fusion.msal.token-redirect.';

/** Outcome of reserving an automatic token redirect in the current tab. */
export type RedirectGuardResult = 'acquired' | 'already-attempted' | 'storage-unavailable';

/**
 * Strips trailing `/` characters in linear time without regex backtracking.
 * @param value - Authority URL string to normalize.
 * @returns Authority without trailing slashes.
 */
function trimTrailingSlashes(value: string): string {
  let end = value.length;
  // Walk backwards in O(n) time to avoid polynomial regex backtracking.
  while (end > 0 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return value.slice(0, end);
}

/**
 * Normalizes OAuth scopes to a sorted, deduplicated, lowercase array.
 * @param scopes - Scope strings from a token request.
 * @returns Canonical scope list.
 */
function normalizeScopes(scopes?: readonly string[]): string[] {
  // Missing or empty scope lists normalize to an empty array.
  if (!scopes?.length) {
    return [];
  }
  const normalized = new Set<string>();
  // Entra treats scope casing and order as equivalent.
  for (const scope of scopes) {
    normalized.add(scope.toLowerCase());
  }
  return [...normalized].sort();
}

/**
 * Computes a synchronous 64-bit FNV-1a hex digest so guard keys stay compact and
 * omit raw account IDs or claims without depending on `crypto.subtle`.
 * @param input - Serialized request identity.
 * @returns 16-character lowercase hex digest.
 */
function hashIdentity(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x050c5d1f;
  // Two independent 32-bit FNV-1a lanes yield a compact 64-bit hex key.
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ (code + i), 0x01000193);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

/**
 * Tab-scoped guard that limits automatic MSAL token redirects to one attempt per
 * authorization request, breaking infinite consent loops (`AADSTS65001`).
 */
export class TokenRedirectGuard {
  #clientId: string;
  #authority: string;
  #fallback = new Set<string>();

  /**
   * Creates a guard scoped to an Entra application and default authority.
   * @param clientId - Entra application ID.
   * @param authority - Default authority URL when the request has no override.
   */
  constructor(clientId: string, authority: string) {
    this.#clientId = clientId;
    this.#authority = authority;
  }

  /**
   * Builds a hashed key from authorization-relevant request fields, ignoring telemetry/state.
   * @param request - MSAL token request.
   * @returns Prefixed storage key.
   */
  #key(request: PopupRequest | RedirectRequest): string {
    const authority = trimTrailingSlashes(request.authority ?? this.#authority).toLowerCase();
    const identity = JSON.stringify([
      this.#clientId,
      authority,
      request.account?.homeAccountId ?? '',
      request.account?.localAccountId ?? '',
      request.account?.tenantId ?? '',
      normalizeScopes(request.scopes),
      request.claims ?? '',
      normalizeScopes(request.extraScopesToConsent),
    ]);
    return `${STORAGE_PREFIX}${hashIdentity(identity)}`;
  }

  /**
   * Resolves `sessionStorage`, returning `undefined` when absent and `null` if access throws.
   * @returns Storage instance, `undefined` (non-browser), or `null` (blocked).
   */
  #getStorage(): Storage | null | undefined {
    try {
      return globalThis.sessionStorage;
    } catch {
      // Distinguish blocked browser storage from an absent non-browser global.
      return null;
    }
  }

  /**
   * Synchronously reserves an automatic redirect attempt for the request.
   * @param request - Token request about to trigger an automatic redirect.
   * @returns `'acquired'`, `'already-attempted'`, or `'storage-unavailable'`.
   */
  tryAcquire(request: PopupRequest | RedirectRequest): RedirectGuardResult {
    const key = this.#key(request);
    const storage = this.#getStorage();

    // Blocked browser storage cannot persist across reloads; refuse automatic redirect.
    if (storage === null) {
      return 'storage-unavailable';
    }

    // Non-browser runtimes without sessionStorage fall back to in-memory tracking.
    if (storage === undefined) {
      // Already reserved in memory for this client instance.
      if (this.#fallback.has(key)) {
        return 'already-attempted';
      }
      this.#fallback.add(key);
      return 'acquired';
    }

    try {
      // Existing entry means this tab already redirected without acquiring a token.
      if (storage.getItem(key) !== null) {
        return 'already-attempted';
      }
      storage.setItem(key, '1');
      return 'acquired';
    } catch {
      // Quota or security errors prevent persisting the guard across page reloads.
      return 'storage-unavailable';
    }
  }

  /**
   * Best-effort removal of a guard entry after token success or pre-navigation redirect failure.
   * @param request - Token request whose guard entry should be cleared.
   */
  clear(request: PopupRequest | RedirectRequest): void {
    const key = this.#key(request);
    this.#fallback.delete(key);

    const storage = this.#getStorage();
    // Skip browser storage cleanup when sessionStorage is absent or blocked.
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(key);
    } catch {
      // Never discard a valid token or mask an MSAL redirect error due to storage cleanup.
    }
  }
}
