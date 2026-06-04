import { Search } from '@equinor/eds-core-react';

type BookmarkFilterProps = {
  readonly searchText: string;
  readonly setSearchText: (newVal: string | null) => void;
};

export const BookmarkFilter = ({ searchText, setSearchText }: BookmarkFilterProps) => {
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
