import type { RemoveFavouriteBookmarkApiVersion, RemoveFavouriteBookmarkRequest } from './types';

import { ApiVersion } from '../static';
import { extractApiVersion } from '../utils';

/**
 * Generates the API endpoint for removing a favorite bookmark.
 *
 * @param version - The API version to use for the endpoint.
 * @param args - The request arguments for removing a favorite bookmark.
 * @returns The generated API endpoint URL.
 */
export const generateEndpoint = <TVersion extends RemoveFavouriteBookmarkApiVersion>(
    version: TVersion,
    args: RemoveFavouriteBookmarkRequest<TVersion>,
) => {
    const apiVersion = extractApiVersion<RemoveFavouriteBookmarkApiVersion>(version);
    switch (apiVersion) {
        case ApiVersion.v1: {
            const { bookmarkId } = args as { bookmarkId: string };
            const params = new URLSearchParams();
            params.append('api-version', '1.0');
            return `/persons/me/bookmarks/favourites/${bookmarkId}/?${String(params)}`;
        }
    }
};
