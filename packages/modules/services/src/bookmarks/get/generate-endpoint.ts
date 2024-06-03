import type { GetBookmarkApiVersion, GetBookmarkRequest } from './types';

import { ApiVersion } from '../static';
import { extractApiVersion } from '../utils';

/**
 * Generates the endpoint URL for retrieving a bookmark based on the specified API version and request arguments.
 *
 * @param version - The API version to use for the endpoint.
 * @param args - The request arguments, including the bookmark ID.
 * @returns The generated endpoint URL.
 */
export const generateEndpoint = <TVersion extends GetBookmarkApiVersion>(
    version: TVersion,
    args: GetBookmarkRequest<TVersion>,
) => {
    const apiVersion = extractApiVersion<GetBookmarkApiVersion>(version);
    switch (apiVersion) {
        case ApiVersion.v1: {
            const { bookmarkId } = args;
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/bookmarks/${bookmarkId}/?${String(params)}`;
        }
    }
};
