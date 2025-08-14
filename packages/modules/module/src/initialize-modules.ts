/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IModulesConfigurator } from './configurator.js';

import type { AnyModule } from './types.js';

/**
 * Initializes the provided modules using the given configurator.
 *
 * @template TModules - An array of modules to be initialized.
 * @template TInstance - The type of the instance to be passed to the configurator (defaults to `any`).
 * @param configurator - An object implementing `IModulesConfigurator` responsible for initializing the modules.
 * @param ref - (Optional) An instance to be passed to the configurator during initialization.
 * @returns The result of the configurator's `initialize` method.
 */
export const initializeModules = <TModules extends Array<AnyModule>, TInstance = any>(
  configurator: IModulesConfigurator<TModules, TInstance>,
  ref?: TInstance,
) => configurator.initialize(ref);

export default initializeModules;
