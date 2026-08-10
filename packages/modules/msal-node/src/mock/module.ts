import type { IModulesConfigurator, Module } from '@equinor/fusion-framework-module';

import type { IAuthProvider } from '../AuthProvider.interface.js';

import { MockAuthProvider } from './MockAuthProvider.js';

/**
 * The `'auth'` module backed by a {@link MockAuthProvider} instead of a real credential.
 */
export type AuthMockModule = Module<'auth', IAuthProvider, MockAuthProvider>;

/**
 * Builds the `'auth'` module descriptor for a given {@link MockAuthProvider}.
 *
 * @remarks
 * `configure` returns `auth` directly as this module's `TConfig` — there is no
 * separate build step, so `initialize` returns it unchanged. Registering this
 * module *is* registering the provider; nothing here is special-cased by the
 * real `authModule`.
 *
 * @param auth - The provider to register. Defaults to a fresh {@link MockAuthProvider}.
 * @returns The module descriptor, ready for {@link IModulesConfigurator.addConfig | addConfig}.
 */
export const createAuthMockModule = (
  auth: MockAuthProvider = new MockAuthProvider(),
): AuthMockModule => ({
  name: 'auth',
  configure: () => auth,
  initialize: async (args) => args.config,
});

/**
 * Configuration callback for {@link enableAuthMock}.
 */
export type AuthMockConfigFn<TRef = unknown> = (auth: MockAuthProvider, ref?: TRef) => void;

/**
 * Enables the `'auth'` module against a {@link MockAuthProvider}, so a test needs
 * no credentials, no network, and no local callback server or device-code flow.
 *
 * @remarks
 * Registered last, this replaces whichever auth module the configurator already
 * carries, so it works on a `FrameworkConfigurator` that pre-registers the real one.
 *
 * @param configurator - The modules configurator to register on.
 * @param configure - Optional callback to seed the identity, token, or expiry.
 * @returns The {@link MockAuthProvider} instance, for calling `login`/`logout`
 *   or its setters directly, in addition to whatever `configure` already did.
 *
 * @example
 * ```typescript
 * const auth = enableAuthMock(configurator, (auth) => {
 *   auth.setAccount({ username: 'ada@equinor.com' });
 * });
 *
 * await auth.login({ request: { scopes: ['User.Read'] } });
 * ```
 */
export const enableAuthMock = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  configure?: AuthMockConfigFn,
): MockAuthProvider => {
  const auth = new MockAuthProvider();
  configurator.addConfig({ module: createAuthMockModule(auth), configure });
  return auth;
};
