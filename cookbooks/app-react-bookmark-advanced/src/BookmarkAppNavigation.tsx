import { useCurrentBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { type FC, type PropsWithChildren, useLayoutEffect } from 'react';
import { useNavigate } from '@equinor/fusion-framework-react-router';

import type { MyBookmark } from './types';

/** Keeps the browser route aligned with the page stored in the current bookmark. */
export const BookmarkAppNavigation: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { currentBookmark } = useCurrentBookmark<MyBookmark>();

  const navigate = useNavigate();

  useLayoutEffect(() => {
    // Restore the bookmarked page when the selected bookmark belongs to another route.
    if (currentBookmark?.payload && !location.pathname.includes(currentBookmark.payload.page)) {
      navigate({ pathname: currentBookmark.payload.page, search: location.search });
    }
  }, [currentBookmark, navigate]);

  return <>{children}</>;
};
