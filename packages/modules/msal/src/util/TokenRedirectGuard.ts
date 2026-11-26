import type {
  CacheLookupPolicy,
  PopupRequest,
  RedirectRequest,
  SilentRequest,
} from '@azure/msal-browser';

const STORAGE_PREFIX = 'fusion.msal.token-redirect.';
const PENDING_PREFIX = 'fusion.msal.token-redirect-pending.';

/** Keys currently initiating a redirect in this JS realm so concurrent duplicates log below error level. */
const inFlightKeys = new Set<string>();

/** Outcome of reserving an automatic token redirect in the current tab. */
export type RedirectGuardResult =
  | 'acquired'
  | 'in-progress'
  | 'already-attempted'
  | 'storage-unavailable';

/**
 * Generates a synchronous RFC 4122 v4 UUID for correlating a guarded redirect
 * request with its eventual `handleRedirectPromise()` result, without requiring
 * `crypto.randomUUID` on non-HTTPS origins.
 * @returns UUID v4 string.
 */
function createCorrelationId(): string {
  // Prefer native randomUUID when running in a secure context.
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  // getRandomValues is available on non-HTTPS origins; fall back to Math.random in minimal runtimes.
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Populate 16 bytes for UUID v4 formatting when Web Crypto is absent.
    for (let i = 0; i < 16; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  let hex = '';
  // Format bytes as lowercase hex for standard UUID layout.
  for (let i = 0; i < 16; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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
  /**
   * Generates a synchronous RFC 4122 v4 UUID for correlating redirect requests.
   * @returns UUID v4 string.
   */
  static createCorrelationId(): string {
    return createCorrelationId();
  }

  #clientId: string;
  #authority: string;
  #defaultCacheLookupPolicy?: CacheLookupPolicy;
  #pendingKey: string;
  #fallback = new Set<string>();
  #fallbackPending?: { correlationId: string; key: string };

  /**
   * Creates a guard scoped to an Entra application, default authority, and default cache policy.
   * @param clientId - Entra application ID.
   * @param authority - Default authority URL when the request has no override.
   * @param defaultCacheLookupPolicy - Client-level default cache lookup policy for silent requests.
   */
  constructor(clientId: string, authority: string, defaultCacheLookupPolicy?: CacheLookupPolicy) {
    this.#clientId = clientId;
    this.#authority = authority;
    this.#defaultCacheLookupPolicy = defaultCacheLookupPolicy;
    this.#pendingKey = `${PENDING_PREFIX}${hashIdentity(clientId)}`;
  }

  /**
   * Builds a hashed key from authorization-relevant and silent-policy request fields,
   * ignoring telemetry/state fields so retries match while cache-hit and refresh-only
   * policies stay isolated.
   * @param request - MSAL token request.
   * @returns Prefixed storage key.
   */
  #key(request: PopupRequest | RedirectRequest): string {
    const silentRequest = request as SilentRequest;
    const authority = trimTrailingSlashes(request.authority ?? this.#authority).toLowerCase();
    const effectiveCachePolicy =
      silentRequest.cacheLookupPolicy ?? this.#defaultCacheLookupPolicy ?? '';
    const identity = JSON.stringify([
      this.#clientId,
      authority,
      request.account?.homeAccountId ?? '',
      request.account?.localAccountId ?? '',
      request.account?.tenantId ?? '',
      normalizeScopes(request.scopes),
      request.claims ?? '',
      normalizeScopes(request.extraScopesToConsent),
      Boolean(silentRequest.forceRefresh),
      effectiveCachePolicy,
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
   * @param correlationId - Optional MSAL correlation ID used to clear only this reservation after redirect success.
   * @returns `'acquired'`, `'in-progress'`, `'already-attempted'`, or `'storage-unavailable'`.
   */
  tryAcquire(request: PopupRequest | RedirectRequest, correlationId?: string): RedirectGuardResult {
    const key = this.#key(request);
    // Same-page concurrent duplicate while the first redirect is still initiating.
    if (inFlightKeys.has(key)) {
      return 'in-progress';
    }

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
      inFlightKeys.add(key);
      // Track pending correlation ID so handleRedirectPromise can clear this entry.
      if (correlationId) {
        this.#fallbackPending = { correlationId, key };
      }
      return 'acquired';
    }

    try {
      // Existing entry means this tab already redirected without acquiring a token.
      if (storage.getItem(key) !== null) {
        return 'already-attempted';
      }
      storage.setItem(key, '1');
    } catch {
      // Quota or security errors prevent persisting the guard across page reloads.
      return 'storage-unavailable';
    }

    inFlightKeys.add(key);

    // Best-effort correlation pointer so a confirmed redirect token clears only its own key.
    if (correlationId) {
      try {
        storage.setItem(this.#pendingKey, `${correlationId}:${key}`);
      } catch {
        // Never fail the already-persisted reservation if the optional pointer cannot be stored.
      }
    }

    return 'acquired';
  }

  /**
   * Marks the current-page redirect initiation as settled while preserving any persisted reservation.
   * @param request - Token request whose in-flight redirect attempt settled.
   */
  endAttempt(request: PopupRequest | RedirectRequest): void {
    inFlightKeys.delete(this.#key(request));
  }

  /**
   * Best-effort removal of a guard entry after token success or pre-navigation redirect failure.
   * @param request - Token request whose guard entry should be cleared.
   */
  clear(request: PopupRequest | RedirectRequest): void {
    const key = this.#key(request);
    inFlightKeys.delete(key);
    this.#fallback.delete(key);
    // Drop the in-memory pending pointer if it belonged to this reservation.
    if (this.#fallbackPending?.key === key) {
      this.#fallbackPending = undefined;
    }

    const storage = this.#getStorage();
    // Skip browser storage cleanup when sessionStorage is absent or blocked.
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(key);
      // Drop the stored pending pointer only when it still references this key.
      if (storage.getItem(this.#pendingKey)?.endsWith(`:${key}`)) {
        storage.removeItem(this.#pendingKey);
      }
    } catch {
      // Never discard a valid token or mask an MSAL redirect error due to storage cleanup.
    }
  }

  /**
   * Best-effort removal of the reservation that initiated a redirect whose `handleRedirectPromise()`
   * returned an access token with a matching correlation ID.
   * @param correlationId - Correlation ID from a successful redirect `AuthenticationResult`.
   */
  clearByCorrelationId(correlationId: string): void {
    // Ignore empty correlation IDs so unrelated responses can never match.
    if (!correlationId) {
      return;
    }

    // Clear in-memory fallback entry when correlation ID matches.
    if (this.#fallbackPending?.correlationId === correlationId) {
      const { key } = this.#fallbackPending;
      inFlightKeys.delete(key);
      this.#fallback.delete(key);
      this.#fallbackPending = undefined;
    }

    const storage = this.#getStorage();
    // Skip browser storage lookup when sessionStorage is absent or blocked.
    if (!storage) {
      return;
    }

    try {
      const pending = storage.getItem(this.#pendingKey);
      const prefix = `${correlationId}:`;
      // Clear only the exact reservation correlated with this redirect result.
      if (pending?.startsWith(prefix)) {
        const key = pending.slice(prefix.length);
        inFlightKeys.delete(key);
        storage.removeItem(key);
        storage.removeItem(this.#pendingKey);
      }
    } catch {
      // Never discard a valid redirect AuthenticationResult due to storage cleanup.
    }
  }
}
