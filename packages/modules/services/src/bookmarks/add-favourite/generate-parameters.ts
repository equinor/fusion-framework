import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { AddFavouriteBookmarkApiVersion, AddFavouriteBookmarkRequest } from './types';

import { generateEndpoint } from './generate-endpoint';

/**
 * Generates the API client arguments for adding a favourite bookmark.
 *
 * @param version - The API version to use.
 * @param request - The request arguments for adding a favourite bookmark.
 * @param init - Optional initialization options for the client request.
 * @returns The API client arguments, including the request path and parameters.
 */
export const generateParameters = <TResult, TVersion extends AddFavouriteBookmarkApiVersion>(
    version: TVersion,
    request: AddFavouriteBookmarkRequest<TVersion>,
    init?: ClientRequestInit<IHttpClient, TResult>,
): ApiClientArguments<IHttpClient, TResult> => {
    const path = generateEndpoint(version, request);
    const params: ClientRequestInit<IHttpClient, TResult> = Object.assign(
        {},
        { method: 'post' },
        init,
    );
    return [path, params];
};
