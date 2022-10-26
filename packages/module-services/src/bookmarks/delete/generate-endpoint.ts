import { ApiVersions, DeleteBookmarkArgs } from './types';

/**
 * Method for generating endpoint for deleting a bookmark.
 */
export const generateEndpoint = <TVersion extends ApiVersions>(
    version: TVersion,
    args: DeleteBookmarkArgs<TVersion>
) => {
    switch (version) {
        case 'v1': {
            const { id } = args as { id: string };
            const params = new URLSearchParams();
            params.append('api-version', '1.0');
            return `/bookmarks/${id}/?${String(params)}`;
        }
        default: {
            const { id } = args as { id: string };
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/bookmarks/${id}/?${String(params)}`;
        }
    }
};
