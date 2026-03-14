import { useEffect, useState } from 'react';

import type { AuthenticationResult } from '@equinor/fusion-framework-module-msal';

import useAppModule from '../useAppModule';

/**
 * React hook that acquires a full MSAL {@link AuthenticationResult} for the
 * requested scopes.
 *
 * The hook attempts silent acquisition first and falls back to an interactive
 * prompt when required by the MSAL provider.
 *
 * @param req - The token request containing the `scopes` to acquire.
 * @param req.scopes - Array of scope strings (e.g. `['User.Read']`).
 * @returns An object with:
 *   - `token` – the full {@link AuthenticationResult}, or `undefined` while pending.
 *   - `pending` – `true` while the token is being acquired.
 *   - `error` – any error encountered during acquisition.
 *
 * @example
 * ```tsx
 * const { token, pending } = useToken({ scopes: ['User.Read'] });
 * if (pending) return <Spinner />;
 * console.log('ID token:', token?.idToken);
 * ```
 */
export const useToken = (req: {
  scopes: string[];
}): { token?: AuthenticationResult; pending: boolean; error: unknown } => {
  const msalProvider = useAppModule('auth');
  const [token, setToken] = useState<AuthenticationResult | undefined>(undefined);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    setPending(true);
    setToken(undefined);
    msalProvider
      .acquireToken({ request: req })
      .then((result) => {
        if (result) {
          setToken(result);
        }
      })
      .catch(setError)
      .finally(() => setPending(false));
  }, [msalProvider, req]);
  return { token, pending, error };
};

export default useToken;
