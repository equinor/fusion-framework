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
    callback?: (builder: AppConfigurator) => void,
): void => {
    configurator.addConfig({
        module,
        configure: (configurator) => {
            if (callback) {
                callback(configurator);
            }
        },
    });
};
