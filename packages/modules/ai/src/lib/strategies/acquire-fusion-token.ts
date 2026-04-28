import type { Service } from '@equinor/fusion-framework-module-service-discovery';

/**
 * Auth provider that can supply an access token.
 *
 * Accepts any provider exposing `acquireToken` — both the MSAL provider
 * (`IMsalProvider`) and the Azure Identity provider (`IAuthProvider`)
 * satisfy this contract via structural typing.
 */
export type AuthProvider = {
  acquireToken(options: {
    request: { scopes: string[] };
  }): Promise<{ accessToken: string; expiresOn: Date | null } | null | undefined>;
};

/**
 * Acquires an access token for the given Fusion AI service entry.
 *
 * Works with both the MSAL provider and the Azure Identity provider
 * since both expose `acquireToken` with compatible signatures.
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
  auth: AuthProvider,
  service: Service,
): Promise<{ token: string; expiresOnTimestamp: number }> => {
  if (!service.scopes) {
    throw new Error(
      'The AI service entry in service discovery must include scopes for authentication. ' +
        'Ensure the service is configured with the correct scopes, or call setAccessToken() with a custom provider.',
    );
  }

  const result = await auth.acquireToken({ request: { scopes: service.scopes } });
  if (!result) {
    throw new Error(
      'Failed to acquire access token for AI service. ' +
        'Ensure the auth module is correctly configured, or call setAccessToken() with a custom provider.',
    );
  }

  const expiresOnTimestamp =
    result.expiresOn instanceof Date
      ? result.expiresOn.getTime()
      : typeof result.expiresOn === 'number'
        ? result.expiresOn
        : Date.now() + 3600_000; // fallback: 1 hour from now

  return {
    token: result.accessToken,
    expiresOnTimestamp,
  };
};
