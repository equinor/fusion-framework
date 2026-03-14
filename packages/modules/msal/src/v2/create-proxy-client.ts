import type { IMsalClient } from '../MsalClient.interface';
import type { IAuthClient } from './IAuthClient.interface';
import { mapAccountInfo } from './map-account-info';
import { mapAuthenticationResult } from './map-authentication-result';
import type { AccountInfo } from './types';

/**
 * Creates a v2-compatible proxy wrapper around an MSAL v4 client.
 *
 * The proxy intercepts property access on the v4 `IMsalClient` and adapts method
 * signatures, return types, and account data to match the v2 `IAuthClient` interface.
 * This allows consumer code written against MSAL v2 to continue working unchanged
 * while the underlying implementation uses MSAL v4/v5.
 *
 * @param client - The MSAL v4 `IMsalClient` instance to wrap
 * @returns A proxy implementing the v2-compatible `IAuthClient` interface
 *
 * @example
 * ```typescript
 * const v4Client = new MsalClient(config);
 * const v2Client = createProxyClient(v4Client);
 *
 * // Use v2-compatible methods
 * const accounts = v2Client.getAllAccounts();
 * const result = await v2Client.acquireTokenSilent({ scopes: ['User.Read'], account });
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
        case 'clearCache': {
          // Cast through unknown to access properties that may exist on MSAL v4 but aren't in the type definition
          // or to handle v2-specific methods like clearCache that exist at runtime
          return (target as unknown as Record<string, unknown>)[prop];
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
