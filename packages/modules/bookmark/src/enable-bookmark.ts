import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module';
import { BookmarkModuleConfigurator } from './BookmarkConfigurator';

/**
 * Method for enabling Bookmark module
 * @param configurator - configuration object
 */
export const enableBookmark = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    builder?: (builder: BookmarkModuleConfigurator) => void | Promise<void>,
): void => {
    configurator.addConfig({
        module,
        configure: (contextConfigurator) => {
            builder && contextConfigurator.addConfigBuilder(builder);
        },
    });
};
