import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import type { AppConfigBuilderCallback } from './AppConfigBuilder';

import { module } from './module';

/**
 * Method for enabling the Service module
 * @param configurator - configuration object
 */
export const enableAppModule = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    builder?: AppConfigBuilderCallback,
): void => {
    configurator.addConfig({
        module,
        configure: (appConfigurator) => {
            builder && appConfigurator.addConfigBuilder(builder);
        },
    });
};
