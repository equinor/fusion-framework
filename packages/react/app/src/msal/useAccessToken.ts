import { useToken } from './useToken';

/**
 * React hook that acquires an OAuth 2.0 access token string via MSAL.
 *
 * This is a convenience wrapper around {@link useToken} that extracts the
 * `accessToken` property from the full `AuthenticationResult`.
 *
 * @param req - The token request containing the `scopes` to acquire.
 * @param req.scopes - Array of scope strings (e.g. `['User.Read']`).
 * @returns An object with:
 *   - `token` – the access token string, or `undefined` while pending.
 *   - `pending` – `true` while the token is being acquired.
 *   - `error` – any error encountered during acquisition.
 *
 * @example
 * ```tsx
 * const { token, pending, error } = useAccessToken({ scopes: ['api://my-api/.default'] });
 * ```
 */
export const useAccessToken = (req: {
  scopes: string[];
}): { token?: string; pending: boolean; error: unknown } => {
  const { token, error, pending } = useToken(req);
  return { token: token?.accessToken, pending, error };
};
