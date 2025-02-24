import type { SemVer } from 'semver';
import type { MsalModuleVersion } from './static';

// this should be defined the @equinor/fusion-framework-module package
export interface IProxyProvider {
  version: string | SemVer;
  createProxyProvider<T>(version: MsalModuleVersion): T;
}
