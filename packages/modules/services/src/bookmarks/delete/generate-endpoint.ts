import { ApiVersion } from '../static';
import { extractApiVersion } from '../utils';
import type { DeleteBookmarkApiVersion, DeleteBookmarkRequest } from './types';

/**
 * Generates the endpoint URL for deleting a bookmark.
 *
 * @param version - The API version to use for the endpoint.
 * @param args - The request arguments for deleting the bookmark.
 * @returns The generated endpoint URL for deleting the bookmark.
 * @throws Error if the API version is unknown.
 */
export const generateEndpoint = <TVersion extends DeleteBookmarkApiVersion>(
    version: TVersion,
    args: DeleteBookmarkRequest<TVersion>,
) => {
    const apiVersion = extractApiVersion<DeleteBookmarkApiVersion>(version);
    switch (apiVersion) {
        case ApiVersion.v1: {
            const { bookmarkId } = args;
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/bookmarks/${bookmarkId}/?${String(params)}`;
        }
    }
};
