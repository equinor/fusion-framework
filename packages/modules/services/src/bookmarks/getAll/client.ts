import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type {
    GetAllBookmarksApiVersion,
    GetAllBookmarksRequest,
    GetAllBookmarksResponse,
    GetAllBookmarksResult,
} from './types';
import type { ClientMethod, ExtractApiVersion } from '../types';

import { extractApiVersion } from '../utils';
import { generateParameters } from './generate-parameters';

type Version<TVersion extends string> = ExtractApiVersion<TVersion, GetAllBookmarksApiVersion>;

/**
 * Method for fetching all bookmarks for the current user from bookmark service.
 * The method returns a function that can be used to fetch the bookmarks.
 *
 * @template TVersion - The version of the API to call.
 * @template TMethod - The client method to use for the request, defaults to 'json'.
 */
export const getAllBookmarks = <
    TVersion extends GetAllBookmarksApiVersion = GetAllBookmarksApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
>(
    version: TVersion,
    client: IHttpClient,
    method: TMethod = 'json' as TMethod,
) => {
    const apiVersion = extractApiVersion<GetAllBookmarksApiVersion>(version);
    const execute = client[method];
    return <
        TResponse = GetAllBookmarksResponse<Version<TVersion>>,
        TResult = GetAllBookmarksResult<Version<TVersion>, TMethod, TResponse>,
    >(
        request?: GetAllBookmarksRequest<TVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => execute(...generateParameters(apiVersion, request, init)) as TResult;
};
