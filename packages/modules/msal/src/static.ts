import { version } from './version';

export const ModuleName = 'msal' as const;

export enum MsalModuleVersion {
  V2 = 'v2',
  Latest = version,
}
