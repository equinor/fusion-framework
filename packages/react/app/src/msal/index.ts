/**
 * MSAL authentication sub-path entry-point.
 *
 * Provides React hooks for accessing MSAL-based authentication state
 * (current account, access tokens) from within a Fusion application.
 *
 * @remarks
 * Requires `@equinor/fusion-framework-module-msal` to be installed and
 * configured by the host/portal. Applications should **not** configure the
 * MSAL module themselves.
 *
 * @packageDocumentation
 */
export { useCurrentAccount } from './useCurrentAccount';
export { useAccessToken } from './useAccessToken';
export { useToken } from './useToken';
