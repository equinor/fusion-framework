import { AccountInfo } from '@equinor/fusion-framework-module-msal';
import useAppModule from '../useAppModule';

/**
 * Retrieves the current account information from the MSAL provider.
 * @returns The current account information or undefined if no account is available.
 */
export const useCurrentAccount = (): AccountInfo | undefined => {
    const msalProvider = useAppModule('auth');
    return msalProvider.defaultAccount;
};
