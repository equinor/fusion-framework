import buildOdataQuery from 'odata-query';

import { UnsupportedApiVersion } from '../../errors';

import { ApiVersion } from '..';

import type {
  QueryContextArgs,
  QueryContextOdataFilter,
  QueryContextOdataParameters,
} from './types';

/**
 * Builds an OData filter object from the given filter object.
 *
 * This function takes a `QueryContextOdataFilter` object and transforms it into an OData filter object.
 * It iterates over the keys of the input object and processes each key according to specific rules.
 *
 * @param filterObj - The filter object to be transformed into an OData filter.
 * @returns A record representing the OData filter.
 *
 * @example
 * ```typescript
 * const filterObj = { type: ['exampleType'], otherKey: 'value' };
 * const odataFilter = buildOdataFilter(filterObj);
 * // odataFilter will be { $filter: { in: ['exampleType'] }, otherKey: 'value' }
 * ```
 */
function buildOdataFilter(filterObj: QueryContextOdataFilter) {
  return Object.keys(filterObj).reduce(
    (acc, key) => {
      switch (key) {
        case 'type':
          if (filterObj[key]?.length) {
            acc[key] = { in: filterObj[key] };
          }
          break;
        default:
          acc[key] = filterObj[key as keyof typeof filterObj];
          break;
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );
}

/**
 * Builds an OData object from the given query context parameters.
 *
 * This function processes the provided parameters, filters out any entries with falsy values,
 * and constructs an OData object. It handles specific keys, such as 'filter', with custom logic.
 *
 * @param parameters - The query context parameters to be converted into an OData object.
 * @returns An OData object constructed from the provided parameters.
 */
function buildOdataObject(parameters: QueryContextOdataParameters) {
  return Object.entries(parameters)
    .filter(([_, value]) => !!value)
    .reduce(
      (acc, [key, value]) => {
        switch (key) {
          case 'filter':
            acc[key] = buildOdataFilter(value as QueryContextOdataFilter);
            break;
          default:
            acc[key] = parameters[key as keyof typeof parameters];
            break;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );
}

/**
 * Creates search parameters based on the provided arguments.
 *
 * @param args - A string or an object containing OData query parameters.
 * @returns A string representing the search parameters.
 */
function createSearchParameters(args: string | QueryContextOdataParameters) {
  return typeof args === 'string' ? args : buildOdataQuery(buildOdataObject(args));
}

/**
 * Generates an endpoint URL based on the provided API version and query context arguments.
 *
 * @template TVersion - The type of the API version, defaults to the keys of `ApiVersion`.
 * @param version - The API version to use for generating the endpoint.
 * @param args - The query context arguments specific to the provided API version.
 * @returns The generated endpoint URL as a string.
 * @throws {UnsupportedApiVersion} If the provided API version is not supported.
 */
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
