import {
    BookmarkData,
    BookmarkPayloadGenerator,
    useCurrentBookmark as _useCurrentBookmark,
} from '@equinor/fusion-framework-react-module-bookmark';
import { BookmarkModule } from '../../../../modules/bookmark/src';
import useAppModule from '../useAppModule';

/**
 * By providing a CreateBookMarkFn bookmarks is enabled for the current application.
 *
 * @template TData - Type of data stored in bookmark
 * @param {CreateBookMarkFn<TData>} [createBookmarkState] - Function for creating bookmark payload, this function should be wrapped in useCallback
 *
 * ```TS
 * // Example
 * const { currentBookmark } = useCurrentBookmark(useCallback(()=> someState, [someState]))
 * ```
 * @return {*}  {CurrentBookmark<TData>}
 */
export const useCurrentBookmark = <TData extends BookmarkData>(
    payloadGenerator?: BookmarkPayloadGenerator<TData>,
) => {
    const provider = useAppModule<BookmarkModule>('bookmark');
    return _useCurrentBookmark<TData>({ provider, payloadGenerator });
};

export default useCurrentBookmark;
