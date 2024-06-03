import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod, ExtractApiVersion } from '../types';
import type {
    AddFavouriteBookmarkApiVersion,
    AddFavouriteBookmarkRequest,
    AddFavouriteBookmarkResponse,
    AddFavouriteBookmarkResult,
} from './types';

import { extractApiVersion } from '../utils';
import { generateParameters } from './generate-parameters';

type Version<TVersion extends string> = ExtractApiVersion<TVersion, AddFavouriteBookmarkApiVersion>;

/**
 * Generates a function that can be used to add a bookmark to favourites using the provided HTTP client.
 *
 * @param client - The HTTP client to use for the API request.
 * @param version - The API version to use.
 * @param method - The HTTP method to use for the API request (default is 'json').
 * @returns A function that can be called to execute the API request with the provided arguments.
 */
export const addFavouriteBookmark = <
    TVersion extends AddFavouriteBookmarkApiVersion = AddFavouriteBookmarkApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
>(
    version: TVersion,
    client: IHttpClient,
    method: TMethod = 'json' as TMethod,
) => {
    const apiVersion = extractApiVersion<AddFavouriteBookmarkApiVersion>(version);
    const execute = client[method];
    return <
        TResponse = AddFavouriteBookmarkResponse<Version<TVersion>>,
        TResult = AddFavouriteBookmarkResult<Version<TVersion>, TMethod, TResponse>,
    >(
        request: AddFavouriteBookmarkRequest<TVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => execute(...generateParameters(apiVersion, request, init)) as TResult;
};
