import { Module, ModulesInstance } from '@equinor/fusion-framework-module';
import { EventModule } from '@equinor/fusion-framework-module-event';
import { ServicesModule } from '@equinor/fusion-framework-module-services';
import { AppModule } from '@equinor/fusion-framework-module-app';
import { ContextModule } from '@equinor/fusion-framework-module-context';
import { BookmarkProvider } from './BookmarkProvider';
import { BookmarkModuleConfigurator } from './BookmarkConfigurator';
import { ConsoleLogger, ILogger } from '@equinor/fusion-log';
import { lastValueFrom } from 'rxjs';

export type BookmarkModuleKey = 'bookmark';

export const moduleKey: BookmarkModuleKey = 'bookmark';

export type BookmarkModule = Module<
    BookmarkModuleKey,
    BookmarkProvider,
    BookmarkModuleConfigurator,
    [EventModule, ServicesModule, AppModule, ContextModule]
>;

// TODO - remove when all framework uses log
const fallbackLogger: ILogger = new ConsoleLogger('BookmarkModule');

export const module: BookmarkModule = {
    name: moduleKey,
    configure: (args) => {
        // use parent logger if available, else fallback to console logger
        const log: ILogger =
            (args?.log as ILogger)?.createSubLogger('BookmarkModule') || fallbackLogger;

        // create a configurator instance
        const configurator = new BookmarkModuleConfigurator({ log });

        // Set client from parent module if available
        const parent = (args as ModulesInstance<[BookmarkModule]>).bookmark;
        if (parent) {
            configurator.setClient(parent.client);
        }

        return configurator;
    },
    initialize: async (args) => {
        const config = await lastValueFrom(
            (args.config as BookmarkModuleConfigurator).createConfig(args),
        );

        return new BookmarkProvider(config);
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
