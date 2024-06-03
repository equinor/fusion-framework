import type { IsFavoriteBookmarkApiVersion, IsFavoriteBookmarkRequest } from './types';

import { ApiVersion } from '../static';
import { extractApiVersion } from '../utils';

/**
 * Generates the API endpoint URL for checking if a bookmark is a favorite.
 *
 * @param version - The API version to use.
 * @param args - The request arguments, including the bookmark ID.
 * @returns The generated API endpoint URL.
 */
export const generateEndpoint = <TVersion extends IsFavoriteBookmarkApiVersion>(
    version: TVersion,
    args: IsFavoriteBookmarkRequest<TVersion>,
) => {
    const apiVersion = extractApiVersion<IsFavoriteBookmarkApiVersion>(version);
    switch (apiVersion) {
        case ApiVersion.v1: {
            const { bookmarkId } = args as { bookmarkId: string };
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/persons/me/bookmarks/favourites/${bookmarkId}?${String(params)}`;
        }
    }
};
