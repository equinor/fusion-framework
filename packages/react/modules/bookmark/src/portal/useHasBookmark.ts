import { useEffect, useState } from 'react';
import { useFramework } from '@equinor/fusion-framework-react';

export const useHasBookmark = (): boolean => {
    const event = useFramework<[]>().modules.event;

    const [hasBookmark, setHasBookmark] = useState(false);

    useEffect(() => {
        const subOnBookmarkChanged = event.addEventListener('onBookmarkChanged', () => {
            setHasBookmark(false);
        });
        const subOnAddCreator = event.addEventListener('onAddCreator', () => {
            setHasBookmark(true);
        });
        return () => {
            subOnBookmarkChanged();
            subOnAddCreator();
        };
    }, [event]);

    return hasBookmark;
};

export default useHasBookmark;
