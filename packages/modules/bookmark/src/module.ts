import { Module, ModulesInstance } from '@equinor/fusion-framework-module';
import { EventModule } from '@equinor/fusion-framework-module-event';
import { ServicesModule } from '@equinor/fusion-framework-module-services';
import { AppModule } from '@equinor/fusion-framework-module-app';
import { ContextModule } from '@equinor/fusion-framework-module-context';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { BookmarkProvider, IBookmarkProvider } from './bookmark-provider';
import { BookmarkModuleConfigurator, IBookmarkModuleConfigurator } from './configurator';

export type BookmarkModuleKey = 'bookmark';

export const moduleKey: BookmarkModuleKey = 'bookmark';

export type BookmarkModule = Module<
    BookmarkModuleKey,
    IBookmarkProvider,
    IBookmarkModuleConfigurator,
    [EventModule, ServicesModule, AppModule, ContextModule, NavigationModule]
>;

export const module: BookmarkModule = {
    name: moduleKey,
    configure: () => new BookmarkModuleConfigurator(),
    initialize: async (args) => {
        const config = await (args.config as BookmarkModuleConfigurator).createConfig(args);
        const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;
        const ref = (args.ref as ModulesInstance<[BookmarkModule]>)?.bookmark;

        // Looks like the navigation module is not needed.
        // const navigation = args.hasModule('navigation')
        //     ? await args.requireInstance('navigation')
        //     : undefined;

        const contextModule = args.hasModule('context')
            ? await args.requireInstance('context')
            : undefined;

        const appModule = args.hasModule('app') ? await args.requireInstance('app') : undefined;

        return new BookmarkProvider({
            config,
            event,
            ref,
            appModule,
            contextModule,
        });
    },
    dispose: (args) => {
        (args.instance as BookmarkProvider).dispose();
    },
};

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        bookmark: BookmarkModule;
    }
}

export default module;
