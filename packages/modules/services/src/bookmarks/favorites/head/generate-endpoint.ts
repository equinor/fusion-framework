import { ApiVersions, HeadBookmarkFavoriteArgs } from './types';

/**
 * Method for generating endpoint for getting bookmark by id
 */
export const generateEndpoint = <TVersion extends ApiVersions>(
    version: TVersion,
    args: HeadBookmarkFavoriteArgs<TVersion>,
) => {
    switch (version) {
        case 'v1':
        default: {
            const { bookmarkId } = args as { bookmarkId: string };
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/persons/me/bookmarks/favourites/${bookmarkId}?${String(params)}`;
        }
    }
};
