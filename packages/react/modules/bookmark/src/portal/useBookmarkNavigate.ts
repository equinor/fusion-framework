import { useLayoutEffect } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import type {
  BookmarkModule,
  BookmarkProviderEvents,
} from '@equinor/fusion-framework-module-bookmark';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

const BOOKMARK_ID_PARM = 'bookmarkId';

type AppPathResolver = (appKey: string) => string;

/**
 * A React Hook for navigation when bookmark change utilizing the configured getAppPath,
 * The also change the current context if the context is provided form the bookmark
 *
 * @param args {{resolveAppPath: AppPathResolver}} - Application path resolver appKey is provided asd identifier used to load application module.
 * Used to configure the navigation path to the bookmarks associated application.
 * default configuration is /apps/:appKey
 */
export const useBookmarkNavigate = (args: { resolveAppPath: AppPathResolver }): void => {
  const { event, context, navigation } = useFramework<[BookmarkModule, NavigationModule]>().modules;

  useLayoutEffect(() => {
    const history = navigation.history;
    const sub = event.addEventListener(
      'onCurrentBookmarkChanged',
      (e: BookmarkProviderEvents['onCurrentBookmarkChanged']) => {
        const location = history.location;
        const appKey = e.detail?.appKey;
        const bookmarkContext = e.detail?.context;

        if (!appKey || !bookmarkContext) {
          return;
        }

        if (!appKey || !bookmarkContext) {
          return;
        }

        const pathname = args.resolveAppPath(appKey);

        if (location.pathname !== pathname) {
          const hash = location.hash;
          const search = location.search ? removeBookmarkIdFromURL(location.search) : undefined;
          history.navigate({ pathname, search, hash }, { action: 'PUSH' });
        }

        if (bookmarkContext) {
          context.currentContext?.id !== bookmarkContext.id &&
            context.setCurrentContextByIdAsync(bookmarkContext.id);
        }
      },
    );
    return sub;
  }, [args, context, event, navigation]);
};

function removeBookmarkIdFromURL(searchParams: string): string {
  const params = new URLSearchParams(searchParams);
  params.delete(BOOKMARK_ID_PARM);
  return `?${params.toString()}`;
}

export default useBookmarkNavigate;
