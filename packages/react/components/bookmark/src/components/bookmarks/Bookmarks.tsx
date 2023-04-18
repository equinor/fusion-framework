import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
import { useBookmarkGrouping } from '../../hooks';
import { BookmarkFilter } from '../filter/Filter';
import { SectionList } from '../sectionList/SectionList';

export const Bookmarks = () => {
    const { bookmarks } = useBookmark();

    const { bookmarkGroups, groupingModes, searchText, setGroupBy, setSearchText, groupByKey } =
        useBookmarkGrouping(bookmarks);

    return (
        <div style={{ width: '95%' }}>
            <div>
                <BookmarkFilter
                    groupBy={groupByKey}
                    groupingModes={Object.keys(groupingModes)}
                    searchText={searchText ?? ''}
                    setGroupBy={setGroupBy}
                    setSearchText={setSearchText}
                />
                <SectionList bookmarkGroups={bookmarkGroups} />
            </div>
        </div>
    );
};
