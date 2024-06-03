import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ApiClientArguments } from '../..';
import { generateEndpoint } from './generate-endpoint';
import type { CreateBookmarkApiVersion, CreateBookmarkRequest } from './types';

/**
 * Generate the API client arguments for creating a bookmark.
 *
 * @param version - The API version to use.
 * @param request - The request arguments for creating a bookmark.
 * @param init - Optional initialization options for the client request.
 * @returns The API client arguments, including the request path and parameters.
 */
export const generateParameters = <
    TResult,
    TVersion extends CreateBookmarkApiVersion,
    TClient extends IHttpClient = IHttpClient,
>(
    version: TVersion,
    request: CreateBookmarkRequest<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
): ApiClientArguments<TClient, TResult> => {
    const path = generateEndpoint(version, request);
    const requestParams: ClientRequestInit<TClient, TResult> = Object.assign(
        {},
        { method: 'post' },
        init,
    );
    return [path, requestParams];
};
