import { ApiVersions, DeleteBookmarkFavoriteArgs } from './types';

/**
 * Method for generating endpoint for deleting a bookmark.
 */
export const generateEndpoint = <TVersion extends ApiVersions>(
    version: TVersion,
    args: DeleteBookmarkFavoriteArgs<TVersion>,
) => {
    switch (version) {
        case 'v1':
        default: {
            const { bookmarkId } = args as { bookmarkId: string };
            const params = new URLSearchParams();
            params.append('api-version', '1.0');
            return `/persons/me/bookmarks/favourites/${bookmarkId}/?${String(params)}`;
        }
    }
};
