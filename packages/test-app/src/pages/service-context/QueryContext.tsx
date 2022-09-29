import { useEffect, useMemo, useState } from 'react';

import {
    ApiVersion,
    QueryContextArgs,
    ApiContextEntity,
} from '@equinor/fusion-framework-module-services/context/query';
import { useContextClient } from './useContextClient';

const useQueryContext = <TVersion extends string = keyof typeof ApiVersion>(
    version: TVersion,
    args: QueryContextArgs<TVersion>
): Array<ApiContextEntity<TVersion>> => {
    const [context, setContext] = useState<unknown | null>(null);

    const client = useContextClient('json$');

    useEffect(() => {
        if (client && args.query.search) {
            const subscription = client.query(String(version), args).subscribe(setContext);
            return () => subscription.unsubscribe();
        }
    }, [client, version, args]);

    return context as Array<ApiContextEntity<TVersion>>;
};

export const QueryContext = () => {
    const [search, setSearch] = useState<string>('krafla');
    const [type, setType] = useState<string>('');
    const query = useMemo(
        () => ({ query: { search, filter: { type: type ? [type] : undefined } } }),
        [search, type]
    );
    const items = useQueryContext('v1', query);
    return (
        <div>
            <label>
                type:
                <select onChange={(e) => setType(e.currentTarget.value)}>
                    <option value="">ALL</option>
                    <option value="ProjectMaster">ProjectMaster</option>
                </select>
            </label>
            <br />
            <label>
                filter:
                <input
                    size={40}
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                />
            </label>
            <pre>
                <code>{JSON.stringify(items, null, 2)}</code>
            </pre>
        </div>
    );
};

export default QueryContext;
