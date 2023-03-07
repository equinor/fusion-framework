import { useLayoutEffect } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { useNavigate } from 'react-router-dom';
import { BookmarkModule } from '@equinor/fusion-framework-module-bookmark';

// import { removeBookmarkIdFromURL } from '@equinor/fusion-framework-module-bookmark/utils';

export const useBookmarkNavigate = (): void => {
    const { event, context, bookmark } = useFramework<[BookmarkModule]>().modules;

    const navigate = useNavigate();

    useLayoutEffect(() => {
        const sub = event.addEventListener('onBookmarkChanged', (e) => {
            const { appKey } = e.detail;

            const bookmarkPath = bookmark.config.appRoute(appKey);

            if (window.location.pathname !== bookmarkPath) {
                const url = new URL(bookmarkPath, window.location.origin);
                url.search = window.location.search;
                navigate(url.pathname + url.search);
            }

            if (e.detail.context) {
                context.contextClient.currentContext?.id !== e.detail.context.id &&
                    context.contextClient.setCurrentContext(e.detail.context.id);
            }

            // removeBookmarkIdFromURL();
        });
        return sub;
    }, [bookmark.config, context, event, navigate]);
};

export default useBookmarkNavigate;
