import buildOdataQuery from 'odata-query';

import { UnsupportedApiVersion } from '@equinor/fusion-framework-module-services/errors';

import { ApiVersion } from '@equinor/fusion-framework-module-services/context';

import type {
    RelatedContextArgs,
    RelatedContextOdataFilter,
    RelatedContextOdataParameters,
} from './types';

const buildOdataFilter = (filterObj: RelatedContextOdataFilter) => {
    return Object.keys(filterObj).reduce((acc, key) => {
        switch (key) {
            case 'type':
                return filterObj[key]?.length ? { ...acc, [key]: { in: filterObj[key] } } : acc;
            default:
                return { ...acc, [key]: filterObj[key as keyof typeof filterObj] };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);
};
const buildOdataObject = (parameters: RelatedContextOdataParameters) => {
    return Object.entries(parameters)
        .filter(([_, value]) => !!value)
        .reduce((acc, [key, value]) => {
            switch (key) {
                case 'filter':
                    return {
                        ...acc,
                        [key]: buildOdataFilter(value as RelatedContextOdataFilter),
                    };
                default:
                    return { ...acc, [key]: parameters[key as keyof typeof parameters] };
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, {} as any);
};

const createSearchParameters = (args: string | RelatedContextOdataParameters) => {
    return typeof args === 'string' ? args : buildOdataQuery(buildOdataObject(args));
};

export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
    version: TVersion,
    args: RelatedContextArgs<TVersion>
) => {
    const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
    switch (apiVersion) {
        case ApiVersion.v2:
            throw new UnsupportedApiVersion(version);
        case ApiVersion.v1:
        default: {
            const { id, query } = args as RelatedContextArgs<'v1'>;
            const params = new URLSearchParams(createSearchParameters(query || ''));
            params.append('api-version', apiVersion);
            return `/contexts/${id}/relations?${String(params)}`;
        }
    }
};

export default generateEndpoint;
