import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { useBookmarkGrouping } from '../hooks';
import { BookmarkFilter } from './filter/Filter';
import { SectionList } from './sectionList/SectionList';
import { css } from '@emotion/css';
import { useEffect } from 'react';

import { Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_right, share, more_vertical, add } from '@equinor/eds-icons';

Icon.add({
    chevron_down,
    chevron_right,
    share,
    more_vertical,
    add,
});

const style = {
    wrapper: css`
        padding-right: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    `,
    list: css`
        overflow-y: auto;
        overflow-x: hidden;
        height: calc((100vh - 85px) - 3rem);
    `,
};

export const Bookmark = () => {
    const { bookmarks, getAllBookmarks } = useBookmark();

    useEffect(() => {
        getAllBookmarks();
    }, [getAllBookmarks]);

    const { bookmarkGroups, groupingModes, searchText, setGroupBy, setSearchText, groupByKey } =
        useBookmarkGrouping(bookmarks);

    return (
        <div className={style.wrapper}>
            <BookmarkFilter
                groupBy={groupByKey}
                groupingModes={Object.keys(groupingModes)}
                searchText={searchText ?? ''}
                setGroupBy={setGroupBy}
                setSearchText={setSearchText}
            />
            <div className={style.list}>
                <SectionList bookmarkGroups={bookmarkGroups} />
            </div>
        </div>
    );
};

export default Bookmark;
