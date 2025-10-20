export {
  module,
  configureMsal,
  enableMSAL,
  type MsalModule,
  type AuthConfigFn,
} from './module';

export type { IMsalProvider } from './MsalProvider.interface';
export type { IMsalClient } from './MsalClient.interface';
export { MsalClient, type MsalClientConfig } from './MsalClient';

export type { AccountInfo, AuthenticationResult } from './types';

export { default } from './module';
