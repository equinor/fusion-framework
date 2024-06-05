import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module';
import { BookmarkModuleConfigurator } from './BookmarkConfigurator';

/**
 * Enables the Bookmark module
 *
 * @param configurator - The configuration object for the modules.
 * @param callback - An optional callback function that receives the `BookmarkModuleConfigurator` instance, allowing for further configuration.
 */
export const enableBookmark = (
    configurator: IModulesConfigurator,
    callback?: (builder: BookmarkModuleConfigurator) => void | Promise<void>,
): void => {
    configurator.addConfig({
        module,
        configure: async (builder) => {
            if (callback) {
                Promise.resolve(callback(builder));
            }
        },
    });
};
