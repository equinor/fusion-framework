import type {
  BookmarkModule,
  BookmarkPayloadGenerator,
} from '@equinor/fusion-framework-module-bookmark';
import type { IAppConfigurator } from './AppConfigurator';

/**
 * When enabling bookmarks for applications, we will for now only provide the portals bookmark provider.
 *
 * This function will add the portals bookmark provider to the applications modules.
 * When adding a payload generator to the bookmark provider, we will intercept the teardown function and add it to a cleanup set.
 *
 * @note
 * The cleanup function will be called when the module is disposed.
 * There are no guarantees that the dispose function will be called, incase of weird behavior.
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
             * @note we can not use the Reflect API to access the property, as the provider is a proxy
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
