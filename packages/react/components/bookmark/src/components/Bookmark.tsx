import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { useBookmarkGrouping } from '../hooks';
import { BookmarkFilter } from './filter/Filter';
import { SectionList } from './sectionList/SectionList';
import { useEffect, useState } from 'react';

import { Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_right, share, more_vertical, add } from '@equinor/eds-icons';

import styled from 'styled-components';
import { Message } from './messages/Message';
import { Loading } from './loading/Loading';
import { useFramework } from '@equinor/fusion-framework-react';

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
    NoContentWrapper: styled.div`
        position: absolute;
        top: 150px;
        bottom: 200px;
        left: 0px;
        right: 0px;
    `,
};

export const Bookmark = () => {
    const { bookmarks, getAllBookmarks } = useBookmark();
    const [loading, setLoading] = useState(true);

    const { event } = useFramework().modules;

    useEffect(() => {
        return event.addEventListener('onBookmarksChanged', () => {
            setLoading(false);
        });
    }, [event]);

    useEffect(() => {
        if (bookmarks.length > 0) {
            setLoading(false);
        }
    }, [bookmarks]);

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
                {bookmarkGroups.length > 0 ? (
                    <SectionList bookmarkGroups={bookmarkGroups} />
                ) : loading ? (
                    <Loading />
                ) : (
                    <Styled.NoContentWrapper>
                        <Message title="No Bookmarks" type="NoContent">
                            You haven't created any bookmarks yet.
                        </Message>
                    </Styled.NoContentWrapper>
                )}
            </Styled.List>
        </Styled.Wrapper>
    );
};

export default Bookmark;
