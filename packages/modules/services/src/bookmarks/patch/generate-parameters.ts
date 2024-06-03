import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { PatchBookmarkRequest, PatchBookmarksApiVersion } from './types';

import { generateEndpoint } from './generate-endpoint';

/**
 * Generates the necessary parameters for a PATCH request to the Bookmarks API.
 *
 * @template TResult - The expected response type from the API.
 * @template TVersion - The version of the Bookmarks API to use.
 * @param version - The version of the Bookmarks API to use.
 * @param args - The arguments to include in the PATCH request.
 * @param init - Optional additional request initialization options.
 * @returns An array containing the API endpoint path and the request parameters.
 */
export const generateParameters = <TResult, TVersion extends PatchBookmarksApiVersion>(
    version: TVersion,
    args: PatchBookmarkRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, args);
    const params: ClientRequestInit<IHttpClient, TResult> = Object.assign(
        {},
        { method: 'patch' },
        init,
    );
    return [path, params];
};
