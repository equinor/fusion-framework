import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { module } from './module';
import { AppConfigurator } from './AppConfigurator';

/**
 * Method for enabling the Service module
 * @param configurator - configuration object
 */
export const enableAppModule = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurator: IModulesConfigurator<any, any>,
  callback?: (builder: AppConfigurator) => void | Promise<void>,
): void => {
  configurator.addConfig({
    module,
    configure: async (configurator) => {
      if (callback) {
        Promise.resolve(callback(configurator));
      }
    },
  });
};
