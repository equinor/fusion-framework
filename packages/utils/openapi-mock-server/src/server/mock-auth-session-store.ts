import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const MOCK_AUTH_COOKIE = '__fusion_mock_auth';

/** A mock user selected for one browser session. */
export interface MockAuthUser {
  /** Deterministic object ID used by application authorization mappings. */
  userId: string;
  /** Display name represented in generated token claims. */
  name?: string;
  /** Username represented in generated token claims. */
  username?: string;
  /** Tenant represented in generated token claims. */
  tenantId?: string;
  /** Additional application-specific claims such as roles. */
  claims?: Record<string, unknown>;
}

/**
 * In-memory session store for mock bearer-token overrides.
 *
 * @remarks
 * Browser contexts are isolated by an opaque HTTP-only cookie. State lasts only
 * for the mock-server process and is never persisted.
 */
export class MockAuthSessionStore {
  #sessions = new Map<string, MockAuthUser>();

  /**
   * Resolves or creates the opaque session associated with a request.
   *
   * @param request - Incoming browser or Playwright request.
   * @param response - Response used to establish a missing session cookie.
   * @returns The opaque session identifier.
   */
  public resolveSessionId(request: IncomingMessage, response: ServerResponse): string {
    const existing = this.#readCookie(request);
    // Existing browser contexts retain their isolated server-side state.
    if (existing) return existing;

    const sessionId = randomUUID();
    response.setHeader(
      'set-cookie',
      `${MOCK_AUTH_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax`,
    );
    return sessionId;
  }

  /**
   * Reads the override for a browser session.
   *
   * @param sessionId - Opaque session identifier.
   * @returns The selected user, or `undefined` when reset or never configured.
   */
  public get(sessionId: string): MockAuthUser | undefined {
    return this.#sessions.get(sessionId);
  }

  /**
   * Configures or replaces a browser session override.
   *
   * @param sessionId - Opaque session identifier.
   * @param user - Validated mock user.
   */
  public set(sessionId: string, user: MockAuthUser): void {
    this.#sessions.set(sessionId, user);
  }

  /**
   * Clears one browser session override.
   *
   * @param sessionId - Opaque session identifier.
   */
  public delete(sessionId: string): void {
    this.#sessions.delete(sessionId);
  }

  /**
   * Clears all browser session overrides when the mock server resets.
   */
  public clear(): void {
    this.#sessions.clear();
  }

  /**
   * Reads this store's opaque cookie from a request.
   *
   * @param request - Incoming request carrying browser cookies.
   * @returns The decoded session ID, or `undefined`.
   */
  #readCookie(request: IncomingMessage): string | undefined {
    const cookies = request.headers.cookie?.split(';') ?? [];
    // Parse independently because a browser context can carry unrelated cookies.
    for (const cookie of cookies) {
      const [name, ...value] = cookie.trim().split('=');
      // Only this mock server's opaque session cookie identifies auth state.
      if (name === MOCK_AUTH_COOKIE) {
        return decodeURIComponent(value.join('='));
      }
    }
    return undefined;
  }
}
