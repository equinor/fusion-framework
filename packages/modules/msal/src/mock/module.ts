import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module, type MsalModule } from '../module';

import { MsalMockConfigurator } from './MsalMockConfigurator';

/**
 * The MSAL module with a mock client instead of a live connection to Entra ID.
 *
 * @remarks
 * Only `configure` differs from the real module. `initialize` is the production
 * one, untouched, so proxy providers, host-provider hoisting and provider
 * initialization all behave exactly as they do in production — and a test
 * observes the real start-up path rather than a rehearsal of it.
 */
export const msalMockModule: MsalModule = {
  ...module,
  configure: () => new MsalMockConfigurator(),
};

/**
 * Configuration callback for {@link enableMsalMock}.
 */
export type AuthConfigMockFn<TRef = unknown> = (
  configurator: MsalMockConfigurator,
  ref?: TRef,
) => void;

/**
 * Enables MSAL against a mock client, so a test needs no credentials and no network.
 *
 * @remarks
 * Registered last, this replaces whichever auth module the configurator already
 * carries, so it works on a `FrameworkConfigurator` that pre-registers the real one.
 *
 * @param configurator - The modules configurator to register on.
 * @param configure - Optional callback to override the default mock client.
 *
 * @example
 * ```typescript
 * enableMsalMock(configurator, (builder) => {
 *   builder.setAccount({ name: 'Ada Lovelace' });
 * });
 * ```
 */
export const enableMsalMock = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  configure?: AuthConfigMockFn,
): void => {
  configurator.addConfig({ module: msalMockModule, configure } as {
    module: MsalModule;
  });
};
