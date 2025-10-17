import { version } from './version';

export const ModuleName = 'msal' as const;

export enum MsalModuleVersion {
  V2 = 'v2',
  V4 = 'v4',
  Latest = version,
}
