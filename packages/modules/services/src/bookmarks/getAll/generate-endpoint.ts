import type { GetAllBookmarksApiVersion, GetAllBookmarksRequest } from './types';
import type { ExtractApiVersion } from '../types';

import buildODataQuery from 'odata-query';
import { ApiVersion } from '../static';
import { extractApiVersion } from '../utils';

/**
 * Converts a filter object into a URL query parameter string.
 *
 * @template TVersion - The version of the API to call.
 * @param filter - The filter object to convert. Can be a string or an object with filter properties.
 * @returns The URL query parameter string representing the filter.
 */
const createFilterParameters = <TVersion extends GetAllBookmarksApiVersion>(
    filter: GetAllBookmarksRequest<ExtractApiVersion<TVersion>>['filter'],
) => {
    return typeof filter === 'string' ? filter : buildODataQuery({ filter });
};

/**
 * Method for generating endpoint for getting all bookmarks
 *
 * @template TVersion - The version of the API to call.
 * @returns The generated endpoint URL.
 */
export const generateEndpoint = <TVersion extends GetAllBookmarksApiVersion>(
    version: TVersion,
    args?: GetAllBookmarksRequest<TVersion>,
): string => {
    const apiVersion = extractApiVersion<GetAllBookmarksApiVersion>(version);
    switch (apiVersion) {
        case ApiVersion.v1: {
            const params = new URLSearchParams();
            params.append('api-version', version);
            if (args?.filter) {
                params.append('filter', createFilterParameters(args.filter));
            }
            return `persons/me/bookmarks/?${String(params)}`;
        }
    }
};
