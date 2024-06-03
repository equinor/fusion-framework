import type { PatchBookmarkRequest, PatchBookmarksApiVersion } from './types';

import { ApiVersion } from '../static';
import { extractApiVersion } from '../utils';

/**
 * Generates the endpoint URL for patching bookmarks based on the specified API version and arguments.
 *
 * @param version - The API version to use for generating the endpoint.
 * @param args - The arguments required for generating the endpoint, including the bookmark ID.
 * @returns The generated endpoint URL.
 */
export const generateEndpoint = <TVersion extends PatchBookmarksApiVersion>(
    version: TVersion,
    args: PatchBookmarkRequest<TVersion>,
) => {
    const apiVersion = extractApiVersion<PatchBookmarksApiVersion>(version);
    switch (apiVersion) {
        case ApiVersion.v1: {
            const params = new URLSearchParams();
            params.append('api-version', version);
            return `/bookmarks/${args.id}?${String(params)}`;
        }
    }
};
