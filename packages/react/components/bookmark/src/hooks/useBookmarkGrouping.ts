import { Bookmark } from '@equinor/fusion-framework-module-bookmark';

import { useState } from 'react';

export type GroupingKeys = 'Group by app' | 'Created by' | 'Group by Context';

const groupingModes: Record<GroupingKeys, (item: Bookmark) => string> = {
    'Group by app': (item: Bookmark) => item.appKey,
    'Created by': (item: Bookmark) => item.createdBy.name,
    'Group by Context': (item: Bookmark) => item?.context?.name ?? 'Unknown',
} as const;

export const useBookmarkGrouping = (bookmarks?: Bookmark[]) => {
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
    field: keyof T
) => {
    return (
        array
            ?.map(getKey)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((groupingProperty) => ({
                groupingProperty,
                values: array
                    .filter((s) => getKey(s) === groupingProperty)
                    .filter((s) => {
                        const fieldData = s[field];
                        if (typeof fieldData === 'string' && searchText) {
                            return fieldData.includes(searchText);
                        }

                        return true;
                    }),
            })) ?? []
    );
};
