import {
  type Module,
  type ModulesInstance,
  SemanticVersion,
} from '@equinor/fusion-framework-module';
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

/** String literal key used to register the bookmark module in the framework. */
export type BookmarkModuleKey = 'bookmark';

/** The module key constant used to identify the bookmark module at runtime. */
export const moduleKey: BookmarkModuleKey = 'bookmark';

/**
 * Type definition for the bookmark framework module.
 *
 * Declares the module key, provider interface, configurator class,
 * and optional peer dependencies (event, services, app, context modules).
 */
export type BookmarkModule = Module<
  BookmarkModuleKey,
  IBookmarkProvider,
  BookmarkModuleConfigurator,
  [EventModule, ServicesModule, AppModule, ContextModule]
>;

// TODO - remove when all framework uses log
const fallbackLogger: ILogger = new ConsoleLogger('BookmarkModule');

/**
 * Bookmark module definition for the Fusion Framework.
 *
 * Handles configuration, initialization (creating a {@link BookmarkProvider}),
 * and disposal of the bookmark module lifecycle.
 *
 * @example
 * ```ts
 * import { enableBookmark } from '@equinor/fusion-framework-module-bookmark';
 *
 * const configure = (configurator) => {
 *   enableBookmark(configurator);
 * };
 * ```
 */
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
