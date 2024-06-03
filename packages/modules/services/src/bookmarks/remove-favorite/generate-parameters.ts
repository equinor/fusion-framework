import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { RemoveFavouriteBookmarkApiVersion, RemoveFavouriteBookmarkRequest } from './types';

import { generateEndpoint } from './generate-endpoint';
/**
 * Generates the parameters for a request to remove a favorite bookmark.
 *
 * @param version - The API version to use for the request.
 * @param request - The request arguments, including the bookmark ID to remove.
 * @param init - Optional additional request initialization options.
 * @returns An array containing the request path and request parameters.
 */
export const generateParameters = <TResult, TVersion extends RemoveFavouriteBookmarkApiVersion>(
    version: TVersion,
    request: RemoveFavouriteBookmarkRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, request);

    const requestParams: ClientRequestInit<IHttpClient, TResult> = Object.assign(
        {},
        { method: 'Delete' },
        init,
    );

    return [path, requestParams];
};
