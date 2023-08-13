import { Search, Autocomplete } from '@equinor/eds-core-react';
import { GroupingKeys } from '../../hooks/useBookmarkGrouping';

import styled from 'styled-components';

type BookmarkFilterProps = {
    readonly searchText: string;
    readonly setSearchText: (newVal: string | null) => void;
    readonly setGroupBy: (groupBy: GroupingKeys) => void;
    readonly groupingModes: string[];
    readonly groupBy: string;
};

const Styled = {
    Root: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
    `,
};

export const BookmarkFilter = ({
    searchText,
    setGroupBy,
    setSearchText,
    groupingModes,
    groupBy,
}: BookmarkFilterProps) => {
    return (
        <Search
            placeholder="Search in my bookmarks"
            value={searchText ?? ''}
            onChange={(e) => {
                setSearchText(e.currentTarget.value.length ? e.currentTarget.value : null);
            }}
        />
    );
    return (
        <Styled.Root>
            <Search
                placeholder="Search in my bookmarks"
                value={searchText ?? ''}
                onChange={(e) => {
                    setSearchText(e.currentTarget.value.length ? e.currentTarget.value : null);
                }}
            />
            <Autocomplete
                options={groupingModes}
                selectedOptions={[groupBy]}
                multiple={false}
                hideClearButton
                autoWidth
                onOptionsChange={(changes) => setGroupBy(changes.selectedItems[0] as GroupingKeys)}
                label={''}
            />
        </Styled.Root>
    );
};
