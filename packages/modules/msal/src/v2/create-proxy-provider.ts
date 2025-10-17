import type { IMsalProvider } from '../MsalProvider.interface';
import type { IMsalProvider as IMsalProvider_v2 } from './MsalProvider.interface';
import type { AccountInfo } from './types';
import { createProxyClient } from './create-proxy-client';
import { mapAccountInfo } from './map-account-info';
import type { MsalModuleVersion } from '../static';

/**
 * Creates a proxy provider for MSAL v2 compatibility.
 *
 * This function creates a proxy that wraps the MSAL v4 provider
 * and provides v2-compatible method signatures and return types.
 * while using the latest MSAL v4 implementation under the hood.
 *
 * @param provider - The base MSAL provider instance
 * @returns A proxy provider with v2-compatible interface
 *
 * @example
 * ```typescript
 * const baseProvider = new MsalProvider(config);
 * const v2Proxy = createProxyProvider_v2(baseProvider);
 *
 * // Use v2-compatible API
 * await v2Proxy.login();
 * const token = await v2Proxy.acquireAccessToken({ scopes: ['User.Read'] });
 * ```
 */
export function createProxyProvider(provider: IMsalProvider): IMsalProvider_v2 {
  // Create a v2-compatible client wrapper using the new client proxy
  const v2Client = createProxyClient(provider.client);

  const proxy = new Proxy(provider, {
    get: (target: IMsalProvider, prop: keyof IMsalProvider_v2) => {
      switch (prop) {
        case 'client': {
          return v2Client;
        }
        case 'defaultClient': {
          console.warn('defaultClient is deprecated, use client instead');
          return v2Client;
        }
        case 'defaultAccount': {
          // Map activeAccount to defaultAccount for v2 compatibility
          const account = target.account;
          if (!account) {
            return undefined;
          }
          return mapAccountInfo(account);
        }
        case 'defaultConfig': {
          console.warn('defaultConfig is deprecated and not available in v4');
          return undefined;
        }
        case 'createClient': {
          console.warn('createClient is deprecated in MSAL v4');
          return () => v2Client;
        }
        case 'acquireToken': {
          return async (req: { scopes: string[]; account?: AccountInfo }) => {
            const result = await target.acquireToken({
              request: { scopes: req.scopes },
              account: req.account ? mapAccountInfo(req.account) : undefined,
            });

            return result || undefined; // Convert null to undefined for v2 compatibility
          };
        }
        case 'acquireAccessToken': {
          return async (req: { scopes: string[]; account?: AccountInfo }) => {
            return await target.acquireAccessToken({
              request: { scopes: req.scopes },
              account: req.account ? mapAccountInfo(req.account) : undefined,
            });
          };
        }
        case 'login': {
          // Adapt v4 login to v2 signature
          return async (options?: { onlyIfRequired?: boolean }) => {
            if (options?.onlyIfRequired && target.account) {
              return; // Skip login if already logged in
            }
            await target.login({ request: { scopes: [] } });
          };
        }
        case 'logout': {
          return async (options?: { redirectUri?: string }) => {
            await target.logout({ redirectUri: options?.redirectUri });
          };
        }
        case 'handleRedirect': {
          return async () => {
            await target.handleRedirect();
            return null; // v2 expects null after redirect
          };
        }
        case 'createProxyProvider': {
          return (version: MsalModuleVersion) => target.createProxyProvider(version);
        }
        case 'dispose': {
          return () => {
            /** noop */
          };
        }
        default: {
          const exhaustiveCheck: never = prop;
          // For any other properties, return the original value
          return (target as unknown as IMsalProvider)[exhaustiveCheck];
        }
      }
    },
  });

  return proxy as unknown as IMsalProvider_v2;
}
