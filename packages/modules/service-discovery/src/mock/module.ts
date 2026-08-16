import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module as serviceDiscoveryModule, type ServiceDiscoveryModule } from '../module';

import { ServiceDiscoveryMockConfigurator } from './ServiceDiscoveryMockConfigurator';

/**
 * The service discovery module with an in-memory registry instead of a live
 * connection to the service registry.
 *
 * @remarks
 * Only `configure` differs from the real module, so the provider, the schema and
 * the initialization flow stay exactly as they are in production.
 */
export const serviceDiscoveryMockModule: ServiceDiscoveryModule = {
  ...serviceDiscoveryModule,
  configure: () => new ServiceDiscoveryMockConfigurator(),
};

/**
 * Configuration callback for {@link enableServiceDiscoveryMock}.
 */
export type ServiceDiscoveryConfigMockFn<TRef = unknown> = (
  configurator: ServiceDiscoveryMockConfigurator,
  ref?: TRef,
) => void;

/**
 * Enables service discovery against an in-memory registry, so a test needs no
 * network and no service registry.
 *
 * @remarks
 * Registered last, this replaces whichever service discovery module the
 * configurator already carries, so it works on a `FrameworkConfigurator` that
 * pre-registers the real one.
 *
 * @param configurator - The modules configurator to register on.
 * @param configure - Optional callback to compose the registry.
 *
 * @example Point every service at a local mock server and add one of your own
 * ```typescript
 * enableServiceDiscoveryMock(configurator, (builder) => {
 *   builder.setBaseUri('http://localhost:6669');
 *   builder.addService({ key: 'my-api' });
 * });
 * ```
 */
export const enableServiceDiscoveryMock = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  configure?: ServiceDiscoveryConfigMockFn,
): void => {
  configurator.addConfig({ module: serviceDiscoveryMockModule, configure } as {
    module: ServiceDiscoveryModule;
  });
};
