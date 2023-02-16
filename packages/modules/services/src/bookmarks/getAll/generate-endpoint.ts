import { ApiVersions } from './types';

/**
 * Method for generating endpoint for getting all bookmarks
 */
export const generateEndpoint = <TVersion extends ApiVersions>(version: TVersion) => {
    switch (version) {
        case 'v1':
        default: {
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `persons/me/bookmarks/?${String(params)}`;
        }
    }
};
