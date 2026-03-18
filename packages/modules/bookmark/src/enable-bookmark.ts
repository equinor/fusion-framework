import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module } from './bookmark-module';
import type { BookmarkModuleConfigurator } from './BookmarkConfigurator';

/**
 * Enables the bookmark module on a Fusion Framework module configurator.
 *
 * This is the primary entry point for adding bookmark support to an application.
 * Call it during the application’s configure phase to register the module.
 * An optional callback allows further customisation of the bookmark configurator
 * (source system, filters, custom client, etc.).
 *
 * @param configurator - The application’s module configurator instance.
 * @param callback - Optional callback that receives the {@link BookmarkModuleConfigurator}
 *   for additional setup such as setting source system, filters, or a custom client.
 *
 * @example
 * ```ts
 * import { enableBookmark } from '@equinor/fusion-framework-module-bookmark';
 *
 * const configure = (configurator) => {
 *   enableBookmark(configurator, (builder) => {
 *     builder.setSourceSystem({ identifier: 'my-app', name: 'My App' });
 *     builder.setFilter('application', true);
 *   });
 * };
 * ```
 */
export const enableBookmark = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurator: IModulesConfigurator<any>,
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
