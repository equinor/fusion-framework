import type { IMsalProvider } from './MsalProvider.interface';
import { MsalModuleVersion } from './static';
import { resolveVersion } from './versioning/resolve-version';
import { createProxyProvider as createProxyProvider_v2 } from './v2/create-proxy-provider';

/**
 * Creates a proxy provider for version compatibility.
 *
 * This function handles the creation of proxy providers that maintain
 * backward compatibility with different MSAL versions while using the
 * latest MSAL v4 implementation under the hood.
 *
 * @param provider - The base MSAL provider instance
 * @param version - The target version string (e.g., '2.0.0', '4.0.0')
 * @returns A proxy provider compatible with the specified version
 *
 * @example
 * ```typescript
 * const baseProvider = new MsalProvider(config);
 * const v2Proxy = createProxyProvider(baseProvider, '2.0.0');
 * ```
 */
export function createProxyProvider<T = IMsalProvider>(
  provider: IMsalProvider,
  version: string,
): T {
  // Resolve the requested version to determine which proxy to create
  const { enumVersion } = resolveVersion(version);

  switch (enumVersion) {
    case MsalModuleVersion.V2:
      // Create v2-compatible proxy with legacy API adapters
      return createProxyProvider_v2(provider) as T;
    case MsalModuleVersion.V4:
      // Create transparent proxy for v4 - passes through to original provider
      // This allows v4 code to be used where any version is expected
      return new Proxy(provider, {
        get: (target: IMsalProvider, prop: keyof IMsalProvider) => {
          switch (prop) {
            case 'version': {
              return target.version;
            }
            case 'msalVersion': {
              return enumVersion;
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
              // backstop to prevent then from being called - this is not an async operation
              if (prop === 'then') return undefined;

              // Exhaustive check: TypeScript-only guard to ensure all IMsalProvider keys are handled
              const exhausted: never = prop;
              return (target as IMsalProvider)[exhausted];
            }
          }
        },
      }) as T;
    default:
      throw new Error(`Version ${version} is not supported`);
  }
}
