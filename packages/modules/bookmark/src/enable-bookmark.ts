import type {
    AnyModule,
    IModulesConfigurator,
    ModuleInitializerArgs,
} from '@equinor/fusion-framework-module';
import { BookmarkConfigBuilder } from './bookmark-config-builder';

import { IBookmarkModuleConfigurator } from './configurator';

import { module } from './module';

/**
 * Method for enabling Bookmark module
 * @param configurator - configuration object
 */
export const enableBookmark = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurator: IModulesConfigurator<any, any>,
    builder?: <TDeps extends Array<AnyModule> = []>(
        builder: BookmarkConfigBuilder<
            TDeps,
            ModuleInitializerArgs<IBookmarkModuleConfigurator, TDeps>
        >
    ) => void | Promise<void>
): void => {
    configurator.addConfig({
        module,
        configure: (contextConfigurator) => {
            builder && contextConfigurator.addConfigBuilder(builder);
        },
    });
};
