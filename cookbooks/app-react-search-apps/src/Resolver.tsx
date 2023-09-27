import { useMemo } from 'react';
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import { Query } from '@equinor/fusion-query';
import {
    SearchableDropdownResolver,
    SearchableDropdownResultItem,
} from '@equinor/fusion-react-searchable-dropdown';
// import { useFramework } from '@equinor/fusion-framework-react-app/framework';

export interface App {
    key: string;
    name: string;
    version: string;
    shortName: string;
    description: string;
    publishedDate: string;
    tags: string[];
    hide: boolean | null;
    order: number;
    type: Type;
    accentColor: string;
    icon: null | string;
    categoryId: string;
    category: Category;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    defaultIcon: string;
}

export enum Type {
    Report = 'Report',
    Standalone = 'Standalone',
}

const queryAppsSelector = async (response: Response) => {
    const result = (await response.json()) as App[];
    const filterVisible = result.filter((app: App) => app.hide != true);

    const newData = filterVisible.map(
        (app: App) =>
            ({
                id: app.key,
                title: app.name,
                subTitle: app.description,
            }) as SearchableDropdownResultItem,
    );

    return newData;
};

const useQueryAllApps = () => {
    const queryAppsExpireTime = 10 * 60 * 1000;
    const client = useHttpClient('portal');
    // const framework = useFramework();

    return useMemo(
        () =>
            new Query({
                key: () => 'apps',
                client: {
                    fn: () =>
                        client.fetchAsync('/api/apps', {
                            selector: queryAppsSelector,
                        }),
                },
                expire: queryAppsExpireTime,
            }),
        [client],
    );
};

export const useAppsResolver = () => {
    const queryOrgUnits = useQueryAllApps();

    const resolver = useMemo(() => {
        return {
            searchQuery: async (query: string) => {
                const data = await queryOrgUnits.queryAsync({});
                const matcher = new RegExp(query, 'i');
                const matched = data.value.filter(
                    (x) => x.title?.match(matcher) || x.subTitle?.match(matcher),
                );
                return matched.map((item) => ({
                    ...item,
                }));
            },
            closeHandler: () => {},
        } as SearchableDropdownResolver;
    }, [queryOrgUnits]);

    return {
        resolver,
        queryOrgUnits,
    };
};
