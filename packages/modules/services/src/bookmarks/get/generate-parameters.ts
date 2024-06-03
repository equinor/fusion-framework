import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { GetBookmarkApiVersion, GetBookmarkRequest } from './types';

import { generateEndpoint } from './generate-endpoint';

/**
 * Generates the API client arguments for a request to the bookmarks service.
 *
 * @param version - The version of the bookmarks API to use.
 * @param args - The request arguments for the bookmarks API.
 * @param init - Optional initialization options for the HTTP client.
 * @returns The API client arguments, including the path and any initialization options.
 */
export const generateParameters = <TResult, TVersion extends GetBookmarkApiVersion>(
    version: TVersion,
    args: GetBookmarkRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, args);
    return [path, init];
};
