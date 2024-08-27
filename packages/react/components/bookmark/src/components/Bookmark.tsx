import { EMPTY } from 'rxjs';
import { useBookmarkGrouping } from '../hooks';
import { BookmarkFilter } from './filter/Filter';
import { SectionList } from './sectionList/SectionList';
import { useEffect, useMemo, useState } from 'react';

import { Icon } from '@equinor/eds-core-react';
import { chevron_down, chevron_right, share, more_vertical, add } from '@equinor/eds-icons';

import styled from 'styled-components';
import { Message } from './messages/Message';
import { Loading } from './loading/Loading';
import { useBookmarkComponentContext } from './BookmarkProvider';
import { useObservableState } from '@equinor/fusion-observable/react';

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
    const { provider } = useBookmarkComponentContext();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { value: bookmarks } = useObservableState(
        useMemo(() => provider?.bookmarks$ || EMPTY, [provider]),
        { initial: provider?.bookmarks },
    );

    useEffect(() => {
        const sub = provider?.getAllBookmarks().subscribe({
            complete: () => {
                setLoading(false);
            },
            error: (err) => {
                setError(err);
            },
        });
        return () => sub?.unsubscribe();
    }, [provider]);

    const { bookmarkGroups, groupingModes, searchText, setGroupBy, setSearchText, groupByKey } =
        useBookmarkGrouping(bookmarks);

    const content = useMemo(() => {
        if (error) {
            return (
                <Message title="Error" type="Error">
                    {error.message}
                </Message>
            );
        }
        if (loading) {
            return <Loading />;
        }
        if (bookmarkGroups.length === 0) {
            return (
                <Message title="No Bookmarks" type="NoContent">
                    You have not created any bookmarks yet.
                </Message>
            );
        }
        return <SectionList bookmarkGroups={bookmarkGroups} />;
    }, [error, loading, bookmarkGroups]);

    return (
        <Styled.Wrapper>
            <BookmarkFilter
                groupBy={groupByKey}
                groupingModes={Object.keys(groupingModes)}
                searchText={searchText ?? ''}
                setGroupBy={setGroupBy}
                setSearchText={setSearchText}
            />
            <Styled.List>{content}</Styled.List>
        </Styled.Wrapper>
    );
};

export default Bookmark;
