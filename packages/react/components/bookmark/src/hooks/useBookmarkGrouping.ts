import type { Bookmarks, BookmarkWithoutData } from '@equinor/fusion-framework-module-bookmark';

import { useState } from 'react';

export type GroupingKeys = 'Group by app' | 'Created by' | 'Group by Context';

const groupingModes: Record<GroupingKeys, (_item: BookmarkWithoutData) => string> = {
  'Group by app': (item: BookmarkWithoutData) => item.appKey,
  'Created by': (item: BookmarkWithoutData) => item.createdBy.name,
  'Group by Context': (item: BookmarkWithoutData) => item?.context?.name ?? 'Unknown',
} as const;

/**
 * Hook for grouping and searching bookmarks by app, creator, or context.
 *
 * @param bookmarks - The bookmarks to group and search
 * @returns The grouped bookmarks along with the search text and grouping key state/setters
 */
export const useBookmarkGrouping = (bookmarks?: Bookmarks) => {
  const [searchText, setSearchText] = useState<string | null>(null);

  const [groupByKey, setGroupBy] = useState<keyof typeof groupingModes>('Group by app');

  const bookmarkGroups = groupBy(bookmarks || [], groupingModes[groupByKey], searchText, 'name');

  return {
    setGroupBy,
    setSearchText,
    searchText,
    bookmarkGroups,
    groupingModes,
    groupByKey,
  };
};

const groupBy = <T>(
  array: T[],
  getKey: (item: T) => string,
  searchText: string | null,
  field: keyof T,
) => {
  // Treat a missing array as an empty one so downstream calls are safe
  const items = array ?? [];
  // Collect the key for every item
  const keys = items.map(getKey);
  // Deduplicate to get the unique set of group keys, preserving first-seen order
  const uniqueKeys = keys.filter((v, i, a) => a.indexOf(v) === i);
  // Build a group entry for each unique key
  const groups = uniqueKeys.map((groupingProperty) => {
    // Only include values in this group whose key matches
    const matchingValues = array.filter((s) => getKey(s) === groupingProperty);
    // Then narrow those matches down by the search-text filter
    const values = matchingValues.filter((s) => {
      const fieldData = s[field];
      // Only apply search-text filtering to string fields
      if (typeof fieldData === 'string' && searchText) {
        return fieldData.includes(searchText);
      }

      return true;
    });
    return { groupingProperty, values };
  });
  return groups;
};
