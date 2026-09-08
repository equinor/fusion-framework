import type { AnyModule, IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module as realModule, type RolesModule } from '../module.js';
import { RolesMockConfigurator } from './RolesMockConfigurator.js';

/**
 * Roles module descriptor using an in-memory client with the production initializer and provider.
 */
export const rolesMockModule: RolesModule = {
  ...realModule,
  configure: () => new RolesMockConfigurator(),
};

/**
 * Configuration callback for {@link enableRolesMock}.
 *
 * @template TRef - Reference type forwarded to the callback.
 */
export type RolesMockConfigFn<TRef = unknown> = (
  configurator: RolesMockConfigurator,
  ref?: TRef,
) => void | Promise<void>;

/**
 * Enables the Roles module with in-memory data and no service-discovery or authentication backend.
 *
 * @param configurator - Modules configurator receiving the mock registration.
 * @param configure - Optional callback for static data and inherited Roles configuration.
 * @template TModules - Module descriptors managed by the configurator.
 * @template TRef - Reference type forwarded to the configuration callback.
 */
export const enableRolesMock = <
  TModules extends Array<AnyModule> = Array<AnyModule>,
  TRef = unknown,
>(
  configurator: IModulesConfigurator<TModules, TRef>,
  configure?: RolesMockConfigFn<TRef>,
): void => {
  configurator.addConfig({ module: rolesMockModule, configure } as {
    module: RolesModule;
  });
};
