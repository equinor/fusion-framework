import {
  useBookmark as _useBookmark,
  type useBookmarkResult,
} from '@equinor/fusion-framework-react-module-bookmark';

/**
 * @deprecated Use useBookmark from @equinor/fusion-framework-react-module-bookmark
 *  For application development the useCurrentBookmark should be sufficient enough
 *
 *  Functionality provided here is:
 *  - addBookmarkCreator
 *  - getAllBookmarks
 *  - createBookmark
 *  - updateBookmark
 *  - deleteBookmarkById
 *  - setCurrentBookmark
 *  - currentBookmark
 *  - bookmarks,
 *
 * @template TData - Current applications  bookmark type
 * @return {*}  {Bookmarks<TData>} the full api fro handling bookmarks
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useBookmark = <TData>(): useBookmarkResult => _useBookmark();

export default useBookmark;
