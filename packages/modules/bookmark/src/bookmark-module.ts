import { type Module, type ModulesInstance, SemanticVersion } from '@equinor/fusion-framework-module';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { ServicesModule } from '@equinor/fusion-framework-module-services';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import { BookmarkProvider } from './BookmarkProvider';
import { BookmarkModuleConfigurator } from './BookmarkConfigurator';
import { ConsoleLogger, type ILogger } from '@equinor/fusion-log';
import { lastValueFrom } from 'rxjs';
import { version } from './version';
import type { IBookmarkProvider } from './BookmarkProvider.interface';

export type BookmarkModuleKey = 'bookmark';

export const moduleKey: BookmarkModuleKey = 'bookmark';

export type BookmarkModule = Module<
  BookmarkModuleKey,
  IBookmarkProvider,
  BookmarkModuleConfigurator,
  [EventModule, ServicesModule, AppModule, ContextModule]
>;

// TODO - remove when all framework uses log
const fallbackLogger: ILogger = new ConsoleLogger('BookmarkModule');

export const module: BookmarkModule = {
  name: moduleKey,
  version: new SemanticVersion(version),
  configure: (args) => {
    // use parent logger if available, else fallback to console logger
    const log: ILogger =
      (args?.log as ILogger)?.createSubLogger('BookmarkModule') || fallbackLogger;

    // Set client from parent module if available
    const ref = args?.ref as ModulesInstance<[BookmarkModule]>;

    // create a configurator instance
    const configurator = new BookmarkModuleConfigurator({ log, ref });

    return configurator;
  },
  initialize: async (args) => {
    const parent = args.ref?.bookmark as BookmarkProvider;
    const config = await lastValueFrom(
      args.config.createConfig(args, {
        filters: parent?.filters,
        sourceSystem: parent?.sourceSystem,
        resolve: parent
          ? {
              application: parent.resolvedApplication.bind(parent),
              context: parent.resolvedContext.bind(parent),
            }
          : undefined,
      }),
    );
    const provider = new BookmarkProvider(config);
    return provider;
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
