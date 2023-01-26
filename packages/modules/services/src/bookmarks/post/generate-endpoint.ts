import { ApiVersions, PostBookmarkArgs } from './types';

/**
 * Method for generating endpoint for getting bookmark by id
 */
export const generateEndpoint = <TVersion extends ApiVersions>(
    version: TVersion,
    _args: PostBookmarkArgs<TVersion>
) => {
    switch (version) {
        case 'v1': {
            const params = new URLSearchParams();
            params.append('api-version', '1.0');
            return `/bookmarks?${String(params)}`;
        }
        default: {
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/bookmarks?${String(params)}`;
        }
    }
};
