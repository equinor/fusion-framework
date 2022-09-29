import buildOdataQuery from 'odata-query';

import { ApiVersion } from '../static';

import type {
    QueryContextArgs,
    QueryContextOdataFilter,
    QueryContextOdataParameters,
} from './types';

const buildOdataFilter = (obj: QueryContextOdataFilter) => {
    return Object.keys(obj).reduce((acc, key) => {
        switch (key) {
            case 'type':
                return obj[key]?.length ? { ...acc, [key]: { in: obj[key] } } : acc;
            default:
                return { ...acc, [key]: obj[key as keyof typeof obj] };
        }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);
};

const buildOdataObject = (q: QueryContextOdataParameters) => {
    return Object.keys(q).reduce((acc, key) => {
        switch (key) {
            case 'filter':
                return { ...acc, [key]: buildOdataFilter(q['filter'] as QueryContextOdataFilter) };
            default:
                return { ...acc, [key]: q[key as keyof typeof q] };
        }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);
};

const createSearchParameters = (args: string | QueryContextOdataParameters) => {
    console.log(buildOdataObject(args as QueryContextOdataParameters));
    return typeof args === 'string' ? args : buildOdataQuery(buildOdataObject(args));
};

export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
    version: TVersion,
    args: QueryContextArgs<TVersion>
) => {
    const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
    switch (version) {
        case ApiVersion.v1:
        case ApiVersion.v2:
        default: {
            const { query, includeDeleted } = args as QueryContextArgs<'v1'>;
            const params = new URLSearchParams(createSearchParameters(query));
            params.append('api-version', apiVersion);
            // if (query) {
            //     params.append('', createSearchParameters(query));
            // }
            if (includeDeleted) {
                params.append('includeDeleted', 'true');
            }
            return `/contexts/?${String(params)}`;
        }
    }
};

export default generateEndpoint;
