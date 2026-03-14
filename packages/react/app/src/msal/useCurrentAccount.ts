import type { AccountInfo } from '@equinor/fusion-framework-module-msal';
import useAppModule from '../useAppModule';

/**
 * React hook that returns the currently signed-in user's MSAL account info.
 *
 * @returns The {@link AccountInfo} for the active account, or `undefined` if
 *   no user is signed in.
 *
 * @example
 * ```tsx
 * const account = useCurrentAccount();
 * if (account) {
 *   console.log('Signed in as', account.name);
 * }
 * ```
 */
export const useCurrentAccount = (): AccountInfo | undefined => {
  const msalProvider = useAppModule('auth');
  return msalProvider.account || undefined;
};
