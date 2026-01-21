import type { SemVer } from 'semver';
import type { MsalModuleVersion } from './static';

import type { IMsalProvider } from './MsalProvider.interface';
import type { IMsalProvider as IMsalProvider_v2 } from './v2/MsalProvider.interface';

/**
 * Type mapping between MSAL module versions and their corresponding provider interfaces.
 *
 * This mapping ensures type-safe creation of proxy providers for different MSAL versions.
 * Each version maps to its appropriate provider interface type.
 *
 * @internal
 */
type ProxyProviderMap = {
  [MsalModuleVersion.V2]: IMsalProvider_v2;
  [MsalModuleVersion.V4]: IMsalProvider;
  [MsalModuleVersion.V5]: IMsalProvider;
};

/**
 * Interface for providers that can create version-compatible proxy providers.
 *
 * This interface enables backward compatibility by allowing providers to create
 * proxies that adapt their API to match different MSAL version signatures. The proxy
 * wraps the v4 implementation and exposes it through older version interfaces.
 *
 * @remarks
 * This interface should ideally be defined in the @equinor/fusion-framework-module package
 * for broader framework compatibility.
 *
 * @property version - The semantic version of the provider
 * @property msalVersion - The MSAL module version enum value
 * @property createProxyProvider - Method to create a version-specific proxy provider
 *
 * @example
 * ```typescript
 * const provider: IMsalProvider = new MsalProvider(config);
 *
 * // Create a v2-compatible proxy
 * const v2Proxy = provider.createProxyProvider('2.0.0');
 * // v2Proxy now has v2-compatible method signatures
 * ```
 */
export interface IProxyProvider {
  /**
   * The semantic version of the provider.
   *
   * This represents the actual version number of the MSAL implementation,
   * following semantic versioning (semver) standards.
   */
  readonly version: string | SemVer;

  /**
   * The MSAL module version enum value indicating the API compatibility level.
   *
   * This property specifies which MSAL version's API surface this provider implements,
   * allowing for version-specific behavior and proxy provider creation.
   */
  msalVersion: MsalModuleVersion;

  /**
   * Creates a proxy provider compatible with the specified MSAL version.
   *
   * The proxy adapts the provider's v4 API to match the requested version's interface,
   * enabling backward compatibility during migration scenarios.
   *
   * @param version - Target version key (V2, V4, or Latest)
   * @returns Proxy provider with version-specific type
   */
  createProxyProvider<T extends keyof ProxyProviderMap>(version: T): ProxyProviderMap[T];
}
