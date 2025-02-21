import { useEffect, useState } from 'react';

import type { AuthenticationResult } from '@equinor/fusion-framework-module-msal';

import useAppModule from '../useAppModule';

/**
 * Custom hook for acquiring an authentication token using MSAL.
 * @param req - The authentication request.
 * @returns An object containing the acquired token, pending state, and error.
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
      .acquireToken(req)
      .then((token) => token && setToken(token))
      .catch(setError)
      .finally(() => setPending(false));
  }, [msalProvider, req]);
  return { token, pending, error };
};

export default useToken;
