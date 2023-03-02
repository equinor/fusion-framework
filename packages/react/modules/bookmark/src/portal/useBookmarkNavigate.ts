import { useEffect } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';
import { useNavigate } from 'react-router-dom';
// import { removeBookmarkIdFromURL } from '@equinor/fusion-framework-module-bookmark/utils';

export const useBookmarkNavigate = (appPathname: (appKey: string) => string): void => {
    const { event, context } = useFramework().modules;

    const navigate = useNavigate();

    useEffect(() => {
        event.addEventListener('onBookmarkChanged', (e) => {
            const { appKey } = e.detail;

            if (window.location.pathname !== appPathname(appKey)) {
                const url = new URL(appPathname(appKey), window.location.origin);
                url.search = window.location.search;
                navigate(url.pathname + url.search);
            }

            if (e.detail.context) {
                context.contextClient.setCurrentContext(e.detail.context.id);
            }

            // removeBookmarkIdFromURL();
        });
    }, [appPathname, context, event, navigate]);
};

export default useBookmarkNavigate;
