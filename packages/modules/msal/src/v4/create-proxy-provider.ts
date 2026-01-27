import type { IMsalProvider } from '../MsalProvider.interface';
import { MsalModuleVersion } from '../static';

/**
 * Creates a v4-compatible proxy provider.
 *
 * Since v4 and v5 are API compatible, this creates a simple passthrough proxy
 * that only adjusts the msalVersion property to report V4 compatibility.
 *
 * @param provider - The base MSAL v5 provider instance to wrap
 * @returns A proxy provider reporting v4 compatibility
 *
 * @example
 * ```typescript
 * const baseProvider = new MsalProvider(config);
 * const v4Proxy = createProxyProvider(baseProvider);
 *
 * // Use with v4-compatible API (same as v5)
 * await v4Proxy.login({ request: { scopes: ['User.Read'] } });
 * ```
 */
export function createProxyProvider(provider: IMsalProvider): IMsalProvider {
  // Create passthrough proxy that only overrides msalVersion
  return new Proxy(provider, {
    get: (target: IMsalProvider, prop: keyof IMsalProvider) => {
      switch (prop) {
        case 'msalVersion': {
          // Report as V4 for compatibility tracking
          return MsalModuleVersion.V4;
        }
        case 'version': {
          return target.version;
        }
        case 'client': {
          return target.client;
        }
        case 'account': {
          return target.account;
        }
        case 'acquireAccessToken': {
          return target.acquireAccessToken.bind(target);
        }
        case 'acquireToken': {
          return target.acquireToken.bind(target);
        }
        case 'login': {
          return target.login.bind(target);
        }
        case 'logout': {
          return target.logout.bind(target);
        }
        case 'handleRedirect': {
          return target.handleRedirect.bind(target);
        }
        case 'createProxyProvider': {
          return target.createProxyProvider.bind(target);
        }
        case 'initialize': {
          return () => {
            // noop - initialize is handled by the provider, not the proxy
          };
        }
        default: {
          // Prevent 'then' from being called - this is not an async operation
          if (prop === 'then') return undefined;

          // Exhaustive check: TypeScript-only guard to ensure all IMsalProvider keys are handled
          const exhausted: never = prop;
          return (target as IMsalProvider)[exhausted];
        }
      }
    },
  }) as IMsalProvider;
}
