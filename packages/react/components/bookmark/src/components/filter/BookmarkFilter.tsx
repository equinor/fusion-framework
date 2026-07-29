import { Search } from '@equinor/eds-core-react';
import type { GroupingKeys } from '../../hooks/useBookmarkGrouping';

import styled from 'styled-components';

type BookmarkFilterProps = {
  readonly searchText: string;
  readonly setSearchText: (newVal: string | null) => void;
  readonly setGroupBy: (groupBy: GroupingKeys) => void;
  readonly groupingModes: string[];
  readonly groupBy: string;
};

const _Styled = {
  Root: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
    `,
};

/**
 * Search and grouping filter controls for the bookmark list.
 *
 * @param props - The component's props
 * @returns The filter controls
 */
export const BookmarkFilter = ({
  searchText,
  setGroupBy: _setGroupBy,
  setSearchText,
  groupingModes: _groupingModes,
  groupBy: _groupBy,
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
};
