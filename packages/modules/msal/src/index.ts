/**
 * @packageDocumentation
 *
 * MSAL authentication module for Fusion Framework.
 *
 * Provides Microsoft Authentication Library (MSAL) integration with support for:
 * - Azure AD / Entra ID authentication (SSO, popup, redirect)
 * - Automatic token management with silent refresh
 * - Module hoisting for shared auth state across application scopes
 * - Backward-compatible v2 proxy layer alongside native MSAL v4/v5 API
 * - Backend-issued SPA authorization code exchange
 *
 * @example
 * ```typescript
 * import { enableMSAL } from '@equinor/fusion-framework-module-msal';
 *
 * enableMSAL(configurator, (builder) => {
 *   builder.setClientConfig({
 *     auth: { clientId: 'your-client-id', tenantId: 'your-tenant-id' },
 *   });
 *   builder.setRequiresAuth(true);
 * });
 * ```
 *
 * @module @equinor/fusion-framework-module-msal
 */

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
