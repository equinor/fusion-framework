import type { Module, ModulesInstance } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { ServicesModule } from '@equinor/fusion-framework-module-services';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import { BookmarkModuleProvider, type IBookmarkModuleProvider } from './bookmark-provider';
import { BookmarkModuleConfigurator, type IBookmarkModuleConfigurator } from './configurator';

export type BookmarkModuleKey = 'bookmark';

export const moduleKey: BookmarkModuleKey = 'bookmark';

export type BookmarkModule = Module<
    BookmarkModuleKey,
    IBookmarkModuleProvider,
    IBookmarkModuleConfigurator,
    [EventModule, ServicesModule, AppModule, ContextModule]
>;

export const module: BookmarkModule = {
    name: moduleKey,
    configure: () => new BookmarkModuleConfigurator(),
    initialize: async (args) => {
        const ref = (args.ref as ModulesInstance<[BookmarkModule]>)?.bookmark;
        const config = await (args.config as BookmarkModuleConfigurator).createConfig(args, ref);

        return new BookmarkModuleProvider(config, ref);
    },
    dispose: (args) => {
        (args.instance as BookmarkModuleProvider).dispose();
    },
};

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        bookmark: BookmarkModule;
    }
}

export default module;
