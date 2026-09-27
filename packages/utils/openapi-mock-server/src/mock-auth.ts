interface MockAuthResponse {
  ok(): boolean;
  status(): number;
  json(): Promise<unknown>;
}

/** Fetch-compatible function used to acquire a token for the active browser session. */
export type MockAuthFetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

/**
 * Cookie-aware request client used to control one mock-auth session.
 *
 * @remarks
 * The structural contract accepts any compatible cookie-aware HTTP client.
 * Playwright's `APIRequestContext` satisfies it directly.
 */
export interface MockAuthRequestClient {
  /** Sends a PUT request through the client's cookie jar. */
  put(url: string, options: { data: unknown }): Promise<MockAuthResponse>;
  /** Sends a GET request through the client's cookie jar. */
  get(url: string): Promise<MockAuthResponse>;
  /** Sends a DELETE request through the client's cookie jar. */
  delete(url: string): Promise<MockAuthResponse>;
}

/** Mock user selected for one isolated server session. */
export interface MockAuthUser {
  /** Deterministic object ID used by application authorization mappings. */
  userId: string;
  /** Display name for generated tokens and account state. */
  name?: string;
  /** Username for generated tokens and account state. */
  username?: string;
  /** Tenant identifier for generated tokens. */
  tenantId?: string;
  /** Additional application-specific claims such as roles. */
  claims?: Record<string, unknown>;
}

/** Non-sensitive metadata for one server session's mock-auth state. */
export interface MockAuthState {
  /** Whether the server session has an override. */
  configured: boolean;
  /** Non-sensitive selected user metadata. */
  user?: Omit<MockAuthUser, 'claims'>;
}

/**
 * Acquires a token for the active mock-server session.
 *
 * @param mockServerUrl - Mock server origin, for example `http://localhost:4010`.
 * @param scopes - OAuth scopes requested by the application.
 * @param request - Fetch-compatible request function. Defaults to the current runtime's `fetch`.
 * @returns The issued token, or `null` when the session has no selected user.
 */
export async function acquireMockAuthToken(
  mockServerUrl: string,
  scopes: string[],
  request: MockAuthFetch = globalThis.fetch,
): Promise<string | null> {
  const response = await request(new URL('/@fusion-mock/auth/token', mockServerUrl), {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ scopes }),
  });
  if (!response.ok) {
    throw new Error(`Mock auth token acquisition failed with status ${response.status}`);
  }

  const resolution: unknown = await response.json();
  if (typeof resolution === 'object' && resolution !== null && 'status' in resolution) {
    if (resolution.status === 'missing') return null;
    if (
      resolution.status === 'issued' &&
      'token' in resolution &&
      typeof resolution.token === 'string'
    ) {
      return resolution.token;
    }
  }
  throw new Error('Mock auth token acquisition returned an unsupported status');
}

/**
 * Creates a client for controlling mock authentication on a Fusion mock server.
 *
 * @param mockServerUrl - Mock server origin, for example `http://localhost:4010`.
 * @returns Helpers that configure, inspect, and reset one request client's session.
 *
 * @example Playwright
 * ```typescript
 * const mockAuth = createMockAuth('http://localhost:4010');
 * await mockAuth.setUser(context.request, {
 *   userId: 'administrator',
 *   claims: { roles: ['Demand.Admin'] },
 * });
 * ```
 */
export function createMockAuth(mockServerUrl: string): {
  setUser(request: MockAuthRequestClient, user: MockAuthUser): Promise<void>;
  getState(request: MockAuthRequestClient): Promise<MockAuthState>;
  reset(request: MockAuthRequestClient): Promise<void>;
} {
  const userUrl = new URL('/@fusion-mock/auth/user', mockServerUrl).href;

  /**
   * Rejects unsuccessful control-plane responses.
   *
   * @param action - Operation being attempted.
   * @param response - Response from the caller's request client.
   */
  const assertSuccessful = (action: string, response: MockAuthResponse): void => {
    // Surface disabled servers and invalid requests instead of returning success-shaped state.
    if (!response.ok()) {
      throw new Error(`Failed to ${action}: mock server returned ${response.status()}`);
    }
  };

  return {
    async setUser(request, user): Promise<void> {
      const response = await request.put(userUrl, { data: user });
      assertSuccessful('select mock user', response);
    },
    async getState(request): Promise<MockAuthState> {
      const response = await request.get(userUrl);
      assertSuccessful('read mock user state', response);
      return (await response.json()) as MockAuthState;
    },
    async reset(request): Promise<void> {
      const response = await request.delete(userUrl);
      assertSuccessful('reset mock user', response);
    },
  };
}
