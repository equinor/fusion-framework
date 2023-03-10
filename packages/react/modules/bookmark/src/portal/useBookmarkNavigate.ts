import { useLayoutEffect } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { BookmarkModule } from '@equinor/fusion-framework-module-bookmark';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';

const BOOKMARK_ID_PARM = 'bookmarkId';

/**
 * A React Hook for navigation when bookmark change utilizing the configured getAppPath,
 * The also change the current context if the context is provided form the bookmark
 */
export const useBookmarkNavigate = (): void => {
    const {
        event,
        context,
        bookmark,
        navigation: { navigator },
    } = useFramework<[BookmarkModule, NavigationModule]>().modules;

    useLayoutEffect(() => {
        const sub = event.addEventListener('onBookmarkChanged', (e) => {
            const { appKey, context: bookmarkContext } = e.detail;

            const pathname = bookmark.config.getAppPath(appKey);

            if (navigator.location.pathname !== pathname) {
                const { hash, search } = navigator.location;

                const to = {
                    pathname,
                    search: removeBookmarkIdFromURL(search),
                    hash,
                };
                navigator.push(to);
            }

            if (bookmarkContext) {
                context.contextClient.currentContext?.id !== bookmarkContext.id &&
                    context.contextClient.setCurrentContext(bookmarkContext.id);
            }
        });
        return sub;
    }, [bookmark.config, context, event, navigator]);
};

function removeBookmarkIdFromURL(searchParams: string): string {
    const params = new URLSearchParams(searchParams);
    params.delete(BOOKMARK_ID_PARM);
    return `?${params.toString()}`;
}

export default useBookmarkNavigate;
