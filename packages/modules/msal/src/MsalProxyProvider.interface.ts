import type { SemVer } from 'semver';
import type { MsalModuleVersion } from './static';

import type { IMsalProvider } from './MsalProvider.interface';
import type { IMsalProvider as IMsalProvider_v2 } from './v2/MsalProvider.interface';

type ProxyProviderMap = {
  [MsalModuleVersion.V2]: IMsalProvider_v2;
  [MsalModuleVersion.V4]: IMsalProvider;
  [MsalModuleVersion.Latest]: IMsalProvider;
};

// this should be defined the @equinor/fusion-framework-module package
export interface IProxyProvider {
  version: string | SemVer;
  createProxyProvider<T extends keyof ProxyProviderMap>(version: T): ProxyProviderMap[T];
}
