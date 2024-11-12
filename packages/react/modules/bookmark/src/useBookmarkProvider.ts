import { BookmarkModule, BookmarkProvider } from '@equinor/fusion-framework-module-bookmark';
import { useModule } from '@equinor/fusion-framework-react-module';

/**
 * Returns the bookmark provider from the current modules.
 * @returns The bookmark provider or undefined if it is not available.
 */
export const useBookmarkProvider = (): BookmarkProvider | undefined =>
    useModule<BookmarkModule>('bookmark');