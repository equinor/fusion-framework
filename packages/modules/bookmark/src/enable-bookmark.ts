import type {
    AnyModule,
    IModulesConfigurator,
    ModuleInitializerArgs,
} from '@equinor/fusion-framework-module';
import type { BookmarkConfigBuilder } from './bookmark-config-builder';

import type { IBookmarkModuleConfigurator } from './configurator';

import { module } from './module';

/**
 * Method for enabling Bookmark module
 * @param configurator - configuration object
 */
export const enableBookmark = (
    // biome-ignore  lint/suspicious/noExplicitAny: allowed in this case
    configurator: IModulesConfigurator<any, any>,
    builder?: <TDeps extends Array<AnyModule> = []>(
        builder: BookmarkConfigBuilder<
            TDeps,
            ModuleInitializerArgs<IBookmarkModuleConfigurator, TDeps>
        >,
    ) => void | Promise<void>,
): void => {
    configurator.addConfig({
        module,
        configure: (contextConfigurator) => {
            builder && contextConfigurator.addConfigBuilder(builder);
        },
    });
};
