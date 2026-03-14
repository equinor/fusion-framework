import type {
  BookmarkModule,
  BookmarkPayloadGenerator,
} from '@equinor/fusion-framework-module-bookmark';
import type { IAppConfigurator } from './AppConfigurator';

/**
 * Enable the bookmark module for a Fusion application.
 *
 * Adds bookmark support by wiring the portal’s bookmark provider into the
 * application’s module set. Payload generators registered by the application
 * are automatically cleaned up when the module is disposed, preventing memory
 * leaks across application load/unload cycles.
 *
 * Import this function from `@equinor/fusion-framework-app/enable-bookmark` or, for
 * React apps, from `@equinor/fusion-framework-react-app/bookmark`.
 *
 * @remarks
 * - The portal must expose a bookmark provider on `ref.bookmark`; if it is
 *   missing, an error is logged and the module initializes as a no-op.
 * - The `@equinor/fusion-framework-module-bookmark` package must be installed,
 *   but do **not** call its `enableBookmark` directly in app code — use this
 *   app-level enabler instead.
 *
 * @param config - The application configurator to register the bookmark module on.
 *
 * @example
 * ```ts
 * import { configureModules } from '@equinor/fusion-framework-app';
 * import { enableBookmark } from '@equinor/fusion-framework-app/enable-bookmark';
 *
 * const initialize = configureModules((configurator) => {
 *   enableBookmark(configurator);
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const enableBookmark = (config: IAppConfigurator): void => {
  // collection of cleanup functions
  const cleanupFunctions = new Set<VoidFunction>();
  config.addConfig({
    module: {
      name: 'bookmark',
      initialize(args) {
        // get the bookmark provider from the ref (portal)
        const provider = args.ref?.bookmark;
        if (!provider) {
          console.error('Bookmark provider not found');
          return {};
        }
        // create a proxy to intercept the addPayloadGenerator method
        return new Proxy(provider, {
          get(target, prop) {
            switch (prop) {
              case 'addPayloadGenerator':
                return (generator: BookmarkPayloadGenerator) => {
                  // catch the teardown function and add it to the cleanup functions
                  const cleanupHandler = target.addPayloadGenerator(generator);
                  cleanupFunctions.add(cleanupHandler);
                  // wrap the teardown function to remove it from the cleanup functions
                  return () => {
                    cleanupFunctions.delete(cleanupHandler);
                    cleanupHandler();
                  };
                };
            }
            /**
             * If the property is not addPayloadGenerator, we want to access the property on the provider
             *
             * @remarks we can not use the Reflect API to access the property, as the provider is a proxy
             * and the Reflect API will not work as expected (can not access private properties)
             */
            if (prop in target) {
              // if the property is a function, bind it to the provider
              if (typeof target[prop] === 'function') {
                return target[prop].bind(target);
              }
              // access the property
              return target[prop];
            }
          },
        });
      },
      dispose() {
        for (const teardown of cleanupFunctions) {
          teardown();
        }
        cleanupFunctions.clear();
      },
    } satisfies BookmarkModule,
  });
};
