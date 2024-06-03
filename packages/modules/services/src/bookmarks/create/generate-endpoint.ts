import type { CreateBookmarkApiVersion, CreateBookmarkRequest } from './types';

import { ApiVersion } from '../static';
import { extractApiVersion } from '../utils';

/**
 * Generates the endpoint URL for creating a new bookmark.
 *
 * @param version - The API version to use for the bookmark creation request.
 * @param _args - The request arguments for creating a new bookmark.
 * @returns The generated endpoint URL for the bookmark creation request.
 */
export const generateEndpoint = <TVersion extends CreateBookmarkApiVersion>(
    version: TVersion,
    _args: CreateBookmarkRequest<TVersion>,
) => {
    const apiVersion = extractApiVersion<CreateBookmarkApiVersion>(version);
    switch (apiVersion) {
        case ApiVersion.v1: {
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/bookmarks?${String(params)}`;
        }
    }
};
