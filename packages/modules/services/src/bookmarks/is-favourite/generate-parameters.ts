import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ApiClientArguments } from '../types';
import type { IsFavoriteBookmarkApiVersion, IsFavoriteBookmarkRequest } from './types';

import { generateEndpoint } from './generate-endpoint';

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
    const params: ClientRequestInit<IHttpClient, TResult> = Object.assign(
        {},
        { method: 'head' },
        init,
    );
    return [path, params];
};
