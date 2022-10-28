import { Module } from '@equinor/fusion-framework-module';

import { EventModule } from '@equinor/fusion-framework-module-event';
import { ServicesModule } from '@equinor/fusion-framework-module-services';
import BookmarkModuleConfigurator, { IBookmarkModuleConfigurator } from 'configurator';

// import { IContextModuleConfigurator, ContextModuleConfigurator } from './configurator';

import { IBookmarkProvider, BookmarkProvider } from './provider';

export type BookmarkModuleKey = 'bookmark';

export const moduleKey: BookmarkModuleKey = 'bookmark';

export type BookmarkModule = Module<
    BookmarkModuleKey,
    IBookmarkProvider<unknown>,
    IBookmarkModuleConfigurator,
    [ServicesModule, EventModule]
>;

export const module: BookmarkModule = {
    name: moduleKey,
    configure: () => new BookmarkModuleConfigurator(),
    initialize: async (args) => {
        const config = await args.config.createConfig(args);
        const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;
        return new BookmarkProvider({ config, event });
    },
};

export default module;
