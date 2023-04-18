import { Bookmark } from '@equinor/fusion-framework-module-bookmark';

import { useState } from 'react';

export type GroupingKeys = 'Group by app' | 'Created by' | 'App groups';

const groupingModes: Record<GroupingKeys, (item: Bookmark) => string> = {
    'Group by app': (item: Bookmark) => item.appKey,
    'Created by': (item: Bookmark) => item.createdBy.name,
    'App groups': (item: Bookmark) => item?.sourceSystem?.subSystem ?? 'Unknown',
} as const;

export function useBookmarkGrouping(bookmarks?: Bookmark[]) {
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
}

function groupBy<T>(
    array: T[],
    getKey: (item: T) => string,
    searchText: string | null,
    field: keyof T
) {
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
                        if (typeof fieldData === 'string') {
                            return searchText ? fieldData.includes(searchText) : true;
                        }

                        return true;
                    }),
            })) ?? []
    );
}
