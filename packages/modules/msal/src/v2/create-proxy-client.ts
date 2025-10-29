import type { IMsalClient } from '../MsalClient.interface';
import type { IAuthClient } from './IAuthClient.interface';
import { mapAccountInfo } from './map-account-info';
import { mapAuthenticationResult } from './map-authentication-result';
import type { AccountInfo } from './types';

/**
 * Creates a v2-compatible proxy for MSAL PublicClientApplication.
 *
 * This function creates a proxy that wraps the MSAL v4 PublicClientApplication
 * and provides v2-compatible method signatures and return types.
 *
 * @param client - The MSAL v4 PublicClientApplication instance
 * @returns A proxy client with v2-compatible interface
 *
 * @example
 * ```typescript
 * const v4Client = new PublicClientApplication(config);
 * const v2Client = createProxyClient_v2(v4Client);
 *
 * // Use v2-compatible methods
 * const accounts = v2Client.getAllAccounts();
 * const token = await v2Client.acquireTokenSilent({ scopes: ['User.Read'], account });
 * ```
 */
export function createProxyClient(client: IMsalClient): IAuthClient {
  const proxy = new Proxy(client, {
    get: (target: IMsalClient, prop: keyof IAuthClient) => {
      switch (prop) {
        case 'getAllAccounts': {
          return () => {
            return target.getAllAccounts().map(mapAccountInfo);
          };
        }

        case 'acquireTokenSilent': {
          return async (request: { scopes: string[]; account: AccountInfo }) => {
            const result = await target.acquireTokenSilent({
              scopes: request.scopes,
              account: request.account, // AccountInfo is compatible between v2/v4
            });

            return mapAuthenticationResult(result);
          };
        }

        case 'loginPopup': {
          return async (request?: { scopes?: string[] }) => {
            const result = await target.loginPopup({
              scopes: request?.scopes || [],
            });

            return mapAuthenticationResult(result);
          };
        }

        case 'logoutRedirect': {
          return async (request?: { postLogoutRedirectUri?: string; account?: AccountInfo }) => {
            await target.logoutRedirect({
              postLogoutRedirectUri: request?.postLogoutRedirectUri,
              account: request?.account,
            });
          };
        }

        case 'handleRedirectPromise': {
          return async () => {
            const result = await target.handleRedirectPromise();

            if (!result) {
              return null;
            }

            return mapAuthenticationResult(result);
          };
        }

        case 'getActiveAccount': {
          return () => {
            const account = target.getActiveAccount();
            if (!account) {
              return null;
            }

            return mapAccountInfo(account);
          };
        }

        case 'tenantId': {
          return target.tenantId;
        }

        case 'account': {
          const account = target.getActiveAccount();
          return account ? mapAccountInfo(account) : undefined;
        }

        case 'hasValidClaims': {
          return target.hasValidClaims;
        }

        case 'clientId': {
          return target.getConfiguration().auth.clientId;
        }

        case 'requestOrigin': {
          return target.getConfiguration().auth.redirectUri;
        }

        case 'login': {
          return async (
            options?: { scopes?: string[]; loginHint?: string },
            behavior?: 'popup' | 'redirect',
            silent?: boolean,
          ) => {
            return await target.login({
              request: {
                scopes: options?.scopes || [],
                loginHint: options?.loginHint,
              },
              behavior: behavior,
              silent: silent,
            });
          };
        }

        case 'acquireToken': {
          return async (
            options?: { scopes?: string[]; loginHint?: string },
            behavior?: 'popup' | 'redirect',
            silent?: boolean,
          ) => {
            return await target.acquireToken({
              request: {
                scopes: options?.scopes || [],
                account: target.getActiveAccount() ?? undefined,
                loginHint: options?.loginHint,
              },
              behavior: behavior,
              silent: silent,
            });
          };
        }

        case 'initialize':
        case 'acquireTokenPopup':
        case 'acquireTokenRedirect':
        case 'acquireTokenByCode':
        case 'addEventCallback':
        case 'removeEventCallback':
        case 'addPerformanceCallback':
        case 'removePerformanceCallback':
        case 'enableAccountStorageEvents':
        case 'disableAccountStorageEvents':
        case 'getConfiguration':
        case 'setActiveAccount':
        case 'getAccountByHomeId':
        case 'getAccountByLocalId':
        case 'getAccountByUsername':
        case 'loginRedirect':
        case 'logout':
        case 'logoutPopup':
        case 'ssoSilent':
        case 'getTokenCache':
        case 'setLogger':
        case 'getLogger':
        case 'initializeWrapperLibrary':
        case 'setNavigationClient':
        case 'hydrateCache':
        case 'getAccount':
        case 'clearCache': {
          return target[prop];
        }

        default: {
          // TypeScript-only guard to catch missing properties at compile time
          const _exhaustiveCheck: never = prop;
          // For any other properties, return the original value
          return (target as unknown as IAuthClient)[_exhaustiveCheck];
        }
      }
    },
  });

  return proxy as unknown as IAuthClient;
}
