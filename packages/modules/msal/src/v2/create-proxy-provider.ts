import type { IMsalProvider } from '../MsalProvider.interface';
import type { IMsalProvider as IMsalProvider_v2 } from './MsalProvider.interface';
import type { AccountInfo as AccountInfo_v2 } from './types';
import type { AcquireTokenOptions } from '../MsalClient.interface';
import { createProxyClient } from './create-proxy-client';
import { mapAccountInfo } from './map-account-info';
import { MsalModuleVersion } from '../static';

/**
 * Checks if a request is in MSAL v4 format.
 *
 * @param req - The request object to check
 * @returns True if the request is in v4 format (has a `request` property with `scopes` and `account`)
 */
function isRequestV4(req: unknown): req is AcquireTokenOptions {
  if (typeof req !== 'object' || req === null) {
    return false;
  }
  const requestV4 = req as AcquireTokenOptions;
  return 'request' in requestV4;
}

/**
 * Creates a proxy provider for MSAL v2 compatibility.
 *
 * This function creates a Proxy that wraps the MSAL v4 provider and provides
 * v2-compatible method signatures and return types while using the latest
 * MSAL v4 implementation under the hood. The proxy handles type conversions
 * and method adaptations to maintain backward compatibility.
 *
 * @param provider - The base MSAL v4 provider instance to wrap
 * @returns A proxy provider implementing the v2-compatible interface
 *
 * @example
 * ```typescript
 * const baseProvider = new MsalProvider(config);
 * const v2Proxy = createProxyProvider(baseProvider);
 *
 * // Use v2-compatible API
 * await v2Proxy.login();
 * const token = await v2Proxy.acquireAccessToken({ scopes: ['User.Read'] });
 * ```
 */
export function createProxyProvider(provider: IMsalProvider): IMsalProvider_v2 {
  // Create a v2-compatible client wrapper using the new client proxy
  const v2Client = createProxyClient(provider.client);

  // Use Proxy to intercept property access and provide v2-compatible implementations
  const proxy = new Proxy(provider, {
    get: (target: IMsalProvider, prop: keyof IMsalProvider_v2) => {
      switch (prop) {
        case 'version': {
          return provider.version;
        }
        case 'msalVersion': {
          return MsalModuleVersion.V2;
        }
        case 'client': {
          // Return the v2-compatible client wrapper
          return v2Client as unknown as IMsalProvider_v2['client'];
        }
        case 'defaultClient': {
          // Deprecated property - redirect to client with warning
          console.warn('defaultClient is deprecated, use client instead');
          return v2Client as unknown as IMsalProvider_v2['defaultClient'];
        }
        case 'defaultAccount': {
          // Map v4 account to v2 format for backward compatibility
          const account = target.account;
          const defaultAccount: IMsalProvider_v2['defaultAccount'] = account
            ? mapAccountInfo(account)
            : undefined;
          return defaultAccount;
        }
        case 'defaultConfig': {
          // Deprecated property - not available in v4
          console.warn('defaultConfig is deprecated and not available in v4');
          return undefined;
        }
        case 'createClient': {
          // Deprecated method - return function that returns v2 client
          console.warn('createClient is deprecated in MSAL v4');
          const createClient: IMsalProvider_v2['createClient'] = () => v2Client;
          return createClient;
        }
        case 'acquireToken': {
          // Adapt v4 acquireToken to v2 signature with proper type mapping
          const acquireToken: IMsalProvider_v2['acquireToken'] = async (req: {
            scopes: string[];
            account?: AccountInfo_v2;
          }) => {
            const args = isRequestV4(req) ? req : { request: { scopes: req.scopes, account: req.account } };
            const result = await target.acquireToken(args);

            // Convert null to undefined for v2 compatibility
            return result || undefined;
          };
          return acquireToken;
        }
        case 'acquireAccessToken': {
          // Adapt v4 acquireAccessToken to v2 signature
          const acquireAccessToken: IMsalProvider_v2['acquireAccessToken'] = async (req: {
            scopes: string[];
            account?: AccountInfo_v2;
          }) => {
            const args = isRequestV4(req) ? req : { request: { scopes: req.scopes, account: req.account } };
            return await target.acquireAccessToken(args);
          };
          return acquireAccessToken;
        }
        case 'login': {
          // Adapt v4 login to v2 signature with optional parameters
          const login: IMsalProvider_v2['login'] = async (options?: {
            onlyIfRequired?: boolean;
          }) => {
            // Skip login if already authenticated and onlyIfRequired is true
            if (options?.onlyIfRequired && target.account) {
              return;
            }
            // Call v4 login with empty scopes (v2 behavior)
            await target.login({ request: { scopes: [] } });
          };
          return login;
        }
        case 'logout': {
          // Adapt v4 logout to v2 signature
          const logout: IMsalProvider_v2['logout'] = async (options?: { redirectUri?: string }) => {
            await target.logout({ redirectUri: options?.redirectUri });
          };
          return logout;
        }
        case 'handleRedirect': {
          // Adapt v4 handleRedirect to v2 signature
          const handleRedirect: IMsalProvider_v2['handleRedirect'] = async () => {
            await target.handleRedirect();
            // v2 expects null after redirect handling
            return null;
          };
          return handleRedirect;
        }
        case 'createProxyProvider': {
          // Generic method to create proxy providers for different versions
          const createProxyProvider: IMsalProvider_v2['createProxyProvider'] = <T = IMsalProvider>(
            version: string,
          ) => target.createProxyProvider(version as MsalModuleVersion) as T;
          return createProxyProvider;
        }
        case 'dispose': {
          // No-op dispose method for v2 compatibility
          return () => {
            /** noop */
          };
        }
        default: {
          if (prop === 'then') {
            return undefined;
          }
          // Exhaustive check to ensure all v2 properties are handled
          const exhaustiveCheck: never = prop;
          // Fallback: return original property from target for any unhandled cases
          return (target as IMsalProvider)[exhaustiveCheck];
        }
      }
    },
  });

  // Return the proxy cast to v2 interface for type safety
  return proxy as unknown as IMsalProvider_v2;
}
