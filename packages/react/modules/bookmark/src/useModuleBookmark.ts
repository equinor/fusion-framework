import { BookmarkModule } from '@equinor/fusion-framework-module-bookmark';
import { useModule } from '@equinor/fusion-framework-react-module';
import { useEffect } from 'react';
import { CreateBookMarkFn, Bookmarks } from './types';
import { useBookmark } from './portal/useBookmark';

export const useModuleBookmark = <TData>(
    createBookmarkState?: CreateBookMarkFn<TData>
): Bookmarks<TData> => {
    const provider = useModule<BookmarkModule>('bookmark');

    const bookmarkProvider = useBookmark<TData>(provider);

    useEffect(() => {
        return bookmarkProvider.addBookmarkCreator(createBookmarkState);
    }, [bookmarkProvider, createBookmarkState]);

    return bookmarkProvider;
};

export default useModuleBookmark;
