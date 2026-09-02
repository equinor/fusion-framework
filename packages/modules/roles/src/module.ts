import type {
  IModuleConfigurator,
  IModulesConfigurator,
  Module,
} from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { MsalModule } from '@equinor/fusion-framework-module-msal';
import type { ServiceDiscoveryModule } from '@equinor/fusion-framework-module-service-discovery';
import type { TelemetryModule } from '@equinor/fusion-framework-module-telemetry';

import {
  type IRolesModuleConfigurator,
  RolesModuleConfigurator,
} from './RolesModuleConfigurator.js';
import { type IRolesProvider, RolesProvider } from './RolesProvider.js';
import { RolesError } from './errors/RolesError.js';

/**
 * Module registry key for the Fusion Framework Roles V2 module.
 */
export const moduleKey = 'roles';

/**
 * Fusion Framework module contract for Roles V2.
 */
export type RolesModule = Module<
  typeof moduleKey,
  IRolesProvider,
  IRolesModuleConfigurator,
  [ServiceDiscoveryModule, MsalModule, EventModule, TelemetryModule]
>;

/**
 * Roles V2 module descriptor with host-to-application client inheritance.
 */
export const module: RolesModule = {
  name: moduleKey,
  configure: () => new RolesModuleConfigurator(),
  initialize: async (args) => {
    const config = await (args.config as RolesModuleConfigurator).createConfigAsync(args);
    const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;
    const telemetry = args.hasModule('telemetry')
      ? await args.requireInstance('telemetry')
      : undefined;
    // Configuration always finalizes a client before module initialization.
    try {
      await config.client.initialize({
        resolveCurrentAccountIdentifier: config.accountResolver,
      });
    } catch (error) {
      throw RolesError.is(error)
        ? error
        : new RolesError('Failed to initialize Roles client.', { cause: error });
    }
    const provider = new RolesProvider(config, { event, telemetry });
    await provider.hasRole(config.requiredRoles, { assert: true, required: true });
    return provider;
  },
};

/**
 * Callback used to configure the Roles V2 module.
 */
export type RolesModuleBuilderCallback = (
  builder: IRolesModuleConfigurator,
) => void | Promise<void>;

/**
 * Creates a module configuration object for advanced Roles V2 setup.
 *
 * @param configure - Callback that customizes the roles configurator.
 * @returns A roles module configuration accepted by `addConfig`.
 */
export const configureRoles = (
  configure: RolesModuleBuilderCallback,
): IModuleConfigurator<RolesModule, unknown> => ({
  module,
  configure,
});

/**
 * Enables the Roles V2 module on a framework, portal, or application configurator.
 *
 * @param configurator - Module configurator receiving the roles registration.
 * @param configure - Optional callback for requirements or a custom client.
 */
export const enableRoles = (
  configurator: IModulesConfigurator,
  configure?: RolesModuleBuilderCallback,
): void => {
  configurator.addConfig(configure ? configureRoles(configure) : { module });
};

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    roles: RolesModule;
  }
}

export default module;
