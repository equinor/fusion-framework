/**
 * Configurable {@link MockAuthProvider | IAuthProvider} test double for
 * `@equinor/fusion-framework-module-msal-node`.
 *
 * @remarks
 * Unlike `token_only` mode's single fixed token, `login`/`logout` actually
 * change state, and the returned token and expiry are both configurable —
 * so a test can exercise sign-in, sign-out, and token-refresh/expiry paths
 * without a real Entra ID tenant, browser, or device-code flow.
 *
 * @example
 * ```typescript
 * import { enableAuthMock } from '@equinor/fusion-framework-module-msal-node/mock';
 *
 * // default identity, already signed in
 * const auth = enableAuthMock(configurator);
 *
 * // or seed the identity/state up front
 * enableAuthMock(configurator, (auth) => {
 *   auth.setAccount({ username: 'ada@equinor.com', signedOut: true });
 * });
 * ```
 *
 * @packageDocumentation
 */
export { MockAuthProvider, type MockAuthProviderOptions } from './MockAuthProvider.js';
export {
  createAuthMockModule,
  enableAuthMock,
  type AuthMockModule,
  type AuthMockConfigFn,
} from './module.js';
