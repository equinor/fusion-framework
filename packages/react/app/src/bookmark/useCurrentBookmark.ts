import {
  BookmarkData,
  BookmarkPayloadGenerator,
  useCurrentBookmark as _useCurrentBookmark,
} from '@equinor/fusion-framework-react-module-bookmark';
import { BookmarkModule } from '../../../../modules/bookmark/src';
import { useFrameworkModule } from '@equinor/fusion-framework-react';
import useAppModules from '../useAppModules';

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
  const appBookmarkProvider = useAppModules<[BookmarkModule]>().bookmark;
  const frameworkBookmarkProvider = useFrameworkModule<BookmarkModule>('bookmark');
  if (!appBookmarkProvider) {
    console.warn(
      '@deprecation',
      'application has not enabled bookmarks, this will not work in the future',
    );
  }
  return _useCurrentBookmark<TData>({
    provider: appBookmarkProvider ?? frameworkBookmarkProvider,
    payloadGenerator,
  });
};

export default useCurrentBookmark;
