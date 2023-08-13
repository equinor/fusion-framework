import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { useBookmarkGrouping } from '../hooks';
import { BookmarkFilter } from './filter/Filter';
import { SectionList } from './sectionList/SectionList';
import { useEffect } from 'react';

import { Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_right, share, more_vertical, add } from '@equinor/eds-icons';

import styled from 'styled-components';

Icon.add({
    chevron_down,
    chevron_right,
    share,
    more_vertical,
    add,
});

const Styled = {
    Wrapper: styled.div`
        padding-right: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    `,
    List: styled.div`
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
        <Styled.Wrapper>
            <BookmarkFilter
                groupBy={groupByKey}
                groupingModes={Object.keys(groupingModes)}
                searchText={searchText ?? ''}
                setGroupBy={setGroupBy}
                setSearchText={setSearchText}
            />
            <Styled.List>
                <SectionList bookmarkGroups={bookmarkGroups} />
            </Styled.List>
        </Styled.Wrapper>
    );
};

export default Bookmark;
