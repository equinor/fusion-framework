import { UnsupportedApiVersion } from '@equinor/fusion-framework-module-services/errors';
import { ApiVersions, GetBookmarkArgs } from './types';

/**
 * Method for generating endpoint for getting bookmark by id
 */
export const generateEndpoint = <TVersion extends ApiVersions>(
    version: TVersion,
    args: GetBookmarkArgs<TVersion>
) => {
    switch (version) {
        case 'v2':
            throw new UnsupportedApiVersion(version);
        case 'v1':
        default: {
            const { id } = args as { id: string };
            const params = new URLSearchParams();
            params.append('api-version', '1.0');
            return `/bookmarks/${id}/?${String(params)}`;
        }
    }
};
