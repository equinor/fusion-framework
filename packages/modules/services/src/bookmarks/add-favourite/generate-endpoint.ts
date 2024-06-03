import type { AddFavouriteBookmarkApiVersion, AddFavouriteBookmarkRequest } from './types';

import { ApiVersion } from '../static';
import { extractApiVersion } from '../utils';

/**
 * Generates the endpoint URL for adding a favorite bookmark.
 *
 * @param version - The API version to use for the endpoint.
 * @param args - NOT IN USE -  The request arguments for adding a favorite bookmark.
 * @returns The generated endpoint URL.
 */
export const generateEndpoint = <TVersion extends AddFavouriteBookmarkApiVersion>(
    version: TVersion,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: AddFavouriteBookmarkRequest<TVersion>,
) => {
    const apiVersion = extractApiVersion<AddFavouriteBookmarkApiVersion>(version);
    switch (apiVersion) {
        case ApiVersion.v1: {
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/persons/me/bookmarks/favourites?${String(params)}`;
        }
    }
};
