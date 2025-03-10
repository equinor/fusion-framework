import buildOdataQuery from 'odata-query';

import { UnsupportedApiVersion } from '../../errors';

import { ApiVersion } from '..';

import type {
  RelatedContextArgs,
  RelatedContextOdataFilter,
  RelatedContextOdataParameters,
} from './types';

/**
 * Builds an OData filter object based on the provided filter object.
 *
 * @param filterObj - The filter object containing key-value pairs to be transformed into an OData filter.
 * @returns A new object representing the OData filter.
 *
 * @example
 * ```typescript
 * const filter = buildOdataFilter({ type: ['exampleType'], otherKey: 'value' });
 * // filter will be { $filter: { in: ['exampleType'] }, otherKey: 'value' }
 * ```
 */
function buildOdataFilter(filterObj: RelatedContextOdataFilter): Record<string, unknown> {
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
 * Builds an OData object from the given parameters.
 *
 * This function takes an object of parameters and processes each key-value pair.
 * It filters out any entries with falsy values and then reduces the remaining entries
 * into a new object. For the 'filter' key, it calls a specific function to build the
 * OData filter. For all other keys, it directly assigns the value from the parameters.
 *
 * @param parameters - The parameters to build the OData object from.
 * @returns An object representing the OData parameters.
 */
function buildOdataObject(parameters: RelatedContextOdataParameters): Record<string, unknown> {
  return Object.entries(parameters)
    .filter(([_, value]) => !!value)
    .reduce(
      (acc, [key, value]) => {
        switch (key) {
          case 'filter':
            acc[key] = buildOdataFilter(value as RelatedContextOdataFilter);
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
 * Creates search parameters for a query.
 *
 * @param args - The arguments for creating search parameters. It can be either a string or an object of type `RelatedContextOdataParameters`.
 * @returns The search parameters as a string.
 */
function createSearchParameters(args: string | RelatedContextOdataParameters): string {
  return typeof args === 'string' ? args : buildOdataQuery(buildOdataObject(args));
}

/**
 * Generates an endpoint URL based on the provided API version and arguments.
 *
 * @template TVersion - The type of the API version, defaults to the keys of `ApiVersion`.
 * @param version - The API version to use for generating the endpoint.
 * @param args - The arguments required to generate the endpoint, including `id` and `query`.
 * @returns The generated endpoint URL as a string.
 * @throws {UnsupportedApiVersion} If the provided API version is not supported.
 */
export const generateEndpoint = <TVersion extends string = keyof typeof ApiVersion>(
  version: TVersion,
  args: RelatedContextArgs<TVersion>,
): string => {
  const apiVersion = ApiVersion[version as keyof typeof ApiVersion] ?? version;
  switch (apiVersion) {
    case ApiVersion.v2:
      throw new UnsupportedApiVersion(version);
    default: {
      const { id, query } = args as RelatedContextArgs<'v1'>;
      const params = new URLSearchParams(createSearchParameters(query || ''));
      params.append('api-version', apiVersion);
      return `/contexts/${id}/relations?${String(params)}`;
    }
  }
};

export default generateEndpoint;
