import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { IsFavoriteBookmarkApiVersion, IsFavoriteBookmarkRequest } from './types';

import { HttpJsonResponseError } from '@equinor/fusion-framework-module-http';
import { generateEndpoint } from './generate-endpoint';

/**
 * Generates the default parameters for a client request to check if a bookmark is a favorite.
 *
 * The request is made using the 'HEAD' HTTP method, and the response is checked to determine if the bookmark is a favorite.
 * If the response is successful (status code 200), the bookmark is considered a favorite.
 * If the response has a status code of 404, the function attempts to parse the response body for additional error information.
 * If the response has any other status code, an `HttpJsonResponseError` is thrown with the status code and any available error data.
 *
 * @returns {ClientRequestInit<IHttpClient, boolean>} The default parameters for the client request.
 */
const defaultParams: ClientRequestInit<IHttpClient, boolean> = {
    method: 'HEAD',
    selector: async (res) => {
        if (res.ok) {
            return true;
        } else if (res.status === 404) {
            return false;
        }
        throw new HttpJsonResponseError(
            `Failed to check if bookmarks is user favourite. Status code: ${res.status}`,
            res,
        );
    },
};

/**
 * Generates the API client arguments for an `IsFavoriteBookmarkRequest`.
 *
 * @param version - The version of the `IsFavoriteBookmarkApiVersion` to use.
 * @param request - The `IsFavoriteBookmarkRequest` to generate the arguments for.
 * @param init - Optional additional request initialization options.
 * @returns The API client arguments, including the path and request parameters.
 */
export const generateParameters = <TResult, TVersion extends IsFavoriteBookmarkApiVersion>(
    version: TVersion,
    request: IsFavoriteBookmarkRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, request);
    const params: ClientRequestInit<IHttpClient, TResult> = Object.assign({}, defaultParams, init);
    return [path, params];
};
