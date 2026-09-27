type MockServerFetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

/**
 * Acquires a token for the active browser session from a Fusion mock server.
 *
 * @param mockServerUrl - Origin of the standalone mock server.
 * @param scopes - OAuth scopes requested by MSAL.
 * @param request - Fetch-compatible browser request function.
 * @returns The issued token, or `null` when the session has no selected user.
 * @throws When the mock server rejects the request or returns an unsupported response.
 */
export async function acquireMockServerToken(
  mockServerUrl: string,
  scopes: string[],
  request: MockServerFetch = globalThis.fetch,
): Promise<string | null> {
  const response = await request(new URL('/@fusion-mock/auth/token', mockServerUrl), {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ scopes }),
  });

  // Surface protocol and configuration failures instead of falling back to another identity.
  if (!response.ok) {
    throw new Error(`Mock auth token acquisition failed with status ${response.status}`);
  }

  const resolution: unknown = await response.json();
  // A missing persona deliberately restores the MSAL mock's built-in identity.
  if (
    typeof resolution === 'object' &&
    resolution !== null &&
    'status' in resolution &&
    resolution.status === 'missing'
  ) {
    return null;
  }
  // Accept only the documented issued-token response shape.
  if (
    typeof resolution === 'object' &&
    resolution !== null &&
    'status' in resolution &&
    resolution.status === 'issued' &&
    'token' in resolution &&
    typeof resolution.token === 'string'
  ) {
    return resolution.token;
  }
  throw new Error('Mock auth token acquisition returned an unsupported status');
}
