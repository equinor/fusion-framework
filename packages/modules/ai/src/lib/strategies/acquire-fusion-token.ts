import type { IMsalProvider } from '@equinor/fusion-framework-module-msal';
import type { Service } from '@equinor/fusion-framework-module-service-discovery';

/**
 * Auth provider that can supply an access token.
 *
 * Accepts both the MSAL provider (`acquireToken`) and the azure-identity
 * provider (`acquireAccessToken`).
 */
type TokenProvider = IMsalProvider | { acquireAccessToken(options: { request: { scopes: string[] } }): Promise<string> };

/**
 * Acquires an access token for the given Fusion AI service entry.
 *
 * Works with both the MSAL provider (returns full `AuthenticationResult`) and
 * the Azure Identity provider (returns a plain token string).
 *
 * @param auth - An MSAL or Azure Identity auth provider.
 * @param service - The resolved Fusion service entry; must include `scopes`.
 * @returns A promise resolving to the raw access token string and its expiry
 *   timestamp in milliseconds since the Unix epoch.
 * @throws {Error} When `service.scopes` is missing or the token cannot be acquired.
 *
 * @example
 * ```typescript
 * import { acquireFusionToken } from './acquire-fusion-token.js';
 *
 * const { token } = await acquireFusionToken(auth, service);
 * ```
 */
export const acquireFusionToken = async (
  auth: TokenProvider,
  service: Service,
): Promise<{ token: string; expiresOnTimestamp: number }> => {
  if (!service.scopes) {
    throw new Error(
      'The AI service entry in service discovery must include scopes for authentication. ' +
        'Ensure the service is configured with the correct scopes, or call setAccessToken() with a custom provider.',
    );
  }

  // Azure Identity provider — returns a plain token string with no expiry metadata.
  if (!('acquireToken' in auth) || typeof auth.acquireToken !== 'function') {
    const accessToken = await auth.acquireAccessToken({ request: { scopes: service.scopes } });
    if (!accessToken) {
      throw new Error(
        'Failed to acquire access token for AI service. ' +
          'Ensure the auth module is correctly configured, or call setAccessToken() with a custom provider.',
      );
    }
    return {
      token: accessToken,
      // No expiry info available from acquireAccessToken — assume 1 hour.
      expiresOnTimestamp: Date.now() + 3600_000,
    };
  }

  // MSAL provider — returns full AuthenticationResult with expiry.
  const token = await auth.acquireToken({ request: { scopes: service.scopes } });
  if (!token) {
    throw new Error(
      'Failed to acquire access token for AI service. ' +
        'Ensure the auth (MSAL) module is correctly configured, or call setAccessToken() with a custom provider.',
    );
  }
  const expiresOnTimestamp =
    token.expiresOn instanceof Date
      ? token.expiresOn.getTime()
      : typeof token.expiresOn === 'number'
        ? token.expiresOn
        : Date.now() + 3600_000; // fallback: 1 hour from now
  return {
    token: token.accessToken,
    expiresOnTimestamp,
  };
};
