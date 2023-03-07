import { useCurrentBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { FC, PropsWithChildren, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { MyBookmark } from './types';

export const BookmarkAppNavigation: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const { currentBookmark } = useCurrentBookmark<MyBookmark>();

    const navigate = useNavigate();

    useLayoutEffect(() => {
        if (currentBookmark && !location.pathname.includes(currentBookmark.payload.page))
            navigate(currentBookmark.payload.page);
    }, [currentBookmark]);

    return <>{children}</>;
};
