import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { GetAllBookmarksApiVersion, GetAllBookmarksRequest } from './types';

import { generateEndpoint } from './generate-endpoint';

/** function for creating http client arguments  */
/**
 * Generates the necessary parameters for an HTTP client to make a request to retrieve all bookmarks.
 *
 * @template TResult - The type of the result of the HTTP client request.
 * @template TVersion - The version of the API to call.
 *
 * @param version - The API version to use.
 * @param request - Optional arguments to customize the request, such as filtering or pagination.
 * @param init - Optional initialization options for the HTTP client request.
 * @returns An array containing the path and initialization options for the HTTP client request.
 */
export const generateParameters = <TResult, TVersion extends GetAllBookmarksApiVersion>(
    version: TVersion,
    request?: GetAllBookmarksRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, request);
    return [path, init];
};
