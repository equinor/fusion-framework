import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod, ExtractApiVersion } from '../types';
import type {
    RemoveFavouriteBookmarkApiVersion,
    RemoveFavouriteBookmarkRequest,
    RemoveFavouriteBookmarkResponse,
    RemoveFavouriteBookmarkResult,
} from './types';

import { extractApiVersion } from '../utils';
import { generateParameters } from './generate-parameters';

type Version<TVersion extends string> = ExtractApiVersion<
    TVersion,
    RemoveFavouriteBookmarkApiVersion
>;

/**
 * Generates a function that can be used to remove a bookmark from favourites using the provided HTTP client.
 *
 * @param client - The HTTP client to use for the API request.
 * @param version - The API version to use for the request.
 * @param method - The HTTP method to use for the request (default is 'fetch').
 * @returns The result of the remove favorite bookmark API request.
 */
export const removeFavouriteBookmark = <
    TVersion extends RemoveFavouriteBookmarkApiVersion = RemoveFavouriteBookmarkApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
>(
    version: TVersion,
    client: IHttpClient,
    method: TMethod = 'fetch' as TMethod,
) => {
    const apiVersion = extractApiVersion<RemoveFavouriteBookmarkApiVersion>(version);
    const execute = client[method];
    return <
        TResponse = RemoveFavouriteBookmarkResponse<Version<TVersion>>,
        TResult = RemoveFavouriteBookmarkResult<Version<TVersion>, TMethod, TResponse>,
    >(
        request: RemoveFavouriteBookmarkRequest<TVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => execute(...generateParameters(apiVersion, request, init)) as TResult;
};
