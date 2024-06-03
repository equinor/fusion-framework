import type { GetBookmarkPayloadApiVersion, GetBookmarkPayloadRequest } from './types';

import { extractApiVersion } from '../utils';
import { ApiVersion } from '../static';
/**
 * Generates the endpoint URL for the GetBookmarkPayload API based on the provided version and arguments.
 *
 * @param version - The API version to use for the endpoint.
 * @param args - The request arguments for the GetBookmarkPayload API.
 * @returns The generated endpoint URL.
 */
export const generateEndpoint = <TVersion extends GetBookmarkPayloadApiVersion>(
    version: TVersion,
    args: GetBookmarkPayloadRequest<TVersion>,
) => {
    const apiVersion = extractApiVersion<GetBookmarkPayloadApiVersion>(version);
    switch (apiVersion) {
        case ApiVersion.v1: {
            const { bookmarkId } = args;
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/bookmarks/${bookmarkId}/?${String(params)}`;
        }
    }
};
