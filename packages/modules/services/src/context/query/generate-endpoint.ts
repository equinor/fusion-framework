import buildOdataQuery from 'odata-query';

import { UnsupportedApiVersion } from '../../errors';

import { ApiVersion } from '..';

import type {
  QueryContextArgs,
  QueryContextOdataFilter,
  QueryContextOdataParameters,
} from './types';

const buildOdataFilter = (filterObj: QueryContextOdataFilter) => {
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

const buildOdataObject = (parameters: QueryContextOdataParameters) => {
  return Object.entries(parameters)
    .filter(([_, value]) => !!value)
    .reduce((acc, [key, value]) => {
      switch (key) {
        case 'filter':
          return {
            ...acc,
            [key]: buildOdataFilter(value as QueryContextOdataFilter),
          };
        default:
          return { ...acc, [key]: parameters[key as keyof typeof parameters] };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);
};

const createSearchParameters = (args: string | QueryContextOdataParameters) => {
  return typeof args === 'string' ? args : buildOdataQuery(buildOdataObject(args));
};

export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
  version: TVersion,
  args: QueryContextArgs<TVersion>,
): string => {
  const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
  switch (apiVersion) {
    case ApiVersion.v2:
      throw new UnsupportedApiVersion(version);
    default: {
      const { query, includeDeleted } = args as QueryContextArgs<'v1'>;
      const params = new URLSearchParams(createSearchParameters(query));
      params.append('api-version', apiVersion);
      if (includeDeleted) {
        params.append('includeDeleted', 'true');
      }
      return `/contexts/?${String(params)}`;
    }
  }
};

export default generateEndpoint;
