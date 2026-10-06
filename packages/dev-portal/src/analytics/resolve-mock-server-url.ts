declare global {
  interface Window {
    /**
     * Origin of the local mock server, set by the dev server's HTML when it runs with `--mock`.
     * Holds the unreplaced `%FUSION_SPA_MSAL_MOCK_SERVER_URL%` placeholder otherwise.
     */
    FUSION_MOCK_SERVER_URL?: string;
  }
}

/**
 * Resolves the origin of the local mock server the dev portal runs against, so mock-only
 * behavior — such as sending analytics to the mock Monitor service — can be turned on safely.
 *
 * @remarks
 * The dev server's HTML sets `window.FUSION_MOCK_SERVER_URL` from the `--mock` option. Without
 * `--mock` the value is an unreplaced placeholder or missing, which is not an `http(s)` URL, so
 * this returns `undefined` and the dev portal behaves exactly as against real services.
 *
 * @param value - The raw value. Defaults to `window.FUSION_MOCK_SERVER_URL`.
 * @returns The mock server origin, or `undefined` when the dev portal is not in mock mode.
 *
 * @example
 * ```ts
 * resolveMockServerUrl('http://localhost:4010/'); // → 'http://localhost:4010'
 * resolveMockServerUrl('%FUSION_SPA_MSAL_MOCK_SERVER_URL%'); // → undefined
 * ```
 */
export function resolveMockServerUrl(
  value: string | undefined = window.FUSION_MOCK_SERVER_URL,
): string | undefined {
  // An unset or unreplaced value means the dev server was not started with `--mock`.
  if (!value) return undefined;
  try {
    const { origin, protocol } = new URL(value);
    // Only an http(s) origin can be a mock server; anything else is treated as not set.
    return protocol === 'http:' || protocol === 'https:' ? origin : undefined;
  } catch {
    return undefined;
  }
}

export default resolveMockServerUrl;
