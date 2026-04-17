import type { IMsalProvider } from '@equinor/fusion-framework-module-msal';
import type { Service } from '@equinor/fusion-framework-module-service-discovery';

/**
 * Acquires an MSAL access token for the given Fusion AI service entry.
 *
 * Validates that the service exposes scopes before requesting a token, and
 * throws descriptive errors when either the service configuration or the MSAL
 * module is not set up correctly.
 *
 * @param auth - The MSAL provider used to acquire the token.
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
  auth: IMsalProvider,
  service: Service,
): Promise<{ token: string; expiresOnTimestamp: number }> => {
  // Guard: the service entry must declare scopes so MSAL knows which resource to request.
  if (!service.scopes) {
    throw new Error(
      'The AI service entry in service discovery must include scopes for MSAL authentication. ' +
        'Ensure the service is configured with the correct scopes, or call setAccessToken() with a custom provider.',
    );
  }
  const token = await auth.acquireToken({ request: { scopes: service.scopes } });
  // Guard: a null/undefined result means MSAL could not obtain a token silently or interactively.
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
