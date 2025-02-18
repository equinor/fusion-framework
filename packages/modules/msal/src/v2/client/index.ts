export type { AuthenticationResult } from '@azure/msal-browser';

export { default, createAuthClient, AuthClientConfig } from './create-auth-client';

export { ConsoleLogger } from './log/console';

export * from './client';
export * from './request';
