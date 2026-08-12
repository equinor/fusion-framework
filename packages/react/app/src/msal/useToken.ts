import { useEffect, useRef, useState } from 'react';

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

  // `req` is typically a fresh object literal each render; key the effect on its
  // scopes' content instead of identity, so it doesn't re-run (and reset `pending`
  // to `true` forever) every time the caller re-renders.
  const scopesKey = req.scopes.join(',');
  const reqRef = useRef(req);
  reqRef.current = req;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scopesKey is a re-run trigger, not read in the body
  useEffect(() => {
    setPending(true);
    setToken(undefined);
    msalProvider
      .acquireToken({ request: reqRef.current })
      .then((result) => {
        // Only update state when a token was actually acquired
        if (result) {
          setToken(result);
        }
      })
      .catch(setError)
      .finally(() => setPending(false));
  }, [msalProvider, scopesKey]);
  return { token, pending, error };
};

export default useToken;
