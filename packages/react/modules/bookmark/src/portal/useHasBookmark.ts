import { useEffect, useState } from 'react';
import { useFrameworkModule } from '@equinor/fusion-framework-react';
import type { BookmarkModule, BookmarkProvider } from '@equinor/fusion-framework-module-bookmark';

/**
 * Hook that reports whether the current app can create bookmarks.
 *
 * @param args - Optional args to supply a specific provider instead of resolving one from the framework
 * @returns `true` once a bookmark payload creator has been registered and bookmarks can be created
 */
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
