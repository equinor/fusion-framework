import { useEffect, useState } from 'react';
import { useFrameworkModule } from '@equinor/fusion-framework-react';
import { BookmarkModule, BookmarkProvider } from '@equinor/fusion-framework-module-bookmark';

export const useHasBookmark = (args?: { provider?: BookmarkProvider }): boolean => {
    const frameworkProvider = useFrameworkModule<BookmarkModule>('bookmark');
    const provider = args?.provider ?? frameworkProvider;

    const [hasBookmark, setHasBookmark] = useState(false);

    useEffect(() => {
        return provider?.on('onBookmarkPayloadCreatorAdded', () => {
            setHasBookmark(provider?.canCreateBookmarks);
        });
    }, [provider]);

    return hasBookmark;
};

export default useHasBookmark;
