import { useCurrentBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { type FC, type PropsWithChildren, useLayoutEffect } from 'react';
import { useNavigate } from '@equinor/fusion-framework-react-router';

import type { MyBookmark } from './types';

export const BookmarkAppNavigation: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { currentBookmark } = useCurrentBookmark<MyBookmark>();

  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (currentBookmark && !location.pathname.includes(currentBookmark.payload.page)) {
      navigate({ pathname: currentBookmark.payload.page, search: location.search });
    }
  }, [currentBookmark, navigate]);

  return <>{children}</>;
};
