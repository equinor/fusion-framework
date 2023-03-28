import { ApiVersions, PostBookmarkFavoritesArgs } from './types';

/**
 * Method for generating endpoint for getting bookmark by id
 */
export const generateEndpoint = <TVersion extends ApiVersions>(
    version: TVersion,
    _args: PostBookmarkFavoritesArgs<TVersion>
) => {
    switch (version) {
        case 'v1':
        default: {
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/persons/me/bookmarks/favorites?${String(params)}`;
        }
    }
};
