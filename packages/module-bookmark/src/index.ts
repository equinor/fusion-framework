import { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './module';
/**
 * Method for enabling the Service module
 * @param config - configuration object
 */
export const enableBookmark = (config: IModulesConfigurator): void => {
    config.addConfig({ module });
};

export {
    BookmarkModuleConfigurator,
    IBookmarkModuleConfigurator,
    IBookmarkModuleConfig,
} from './configurator';

export {
    default,
    BookmarkModule,
    module as bookmarkModule,
    moduleKey as bookmarkModuleKey,
} from './module';

export * from './types';
