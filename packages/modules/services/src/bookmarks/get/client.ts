import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type {
    GetBookmarkApiVersion,
    GetBookmarkRequest,
    GetBookmarkResponse,
    GetBookmarkResult,
} from './types';
import type { ClientMethod, ExtractApiVersion } from '../types';

import { extractApiVersion } from '../utils';
import { generateParameters } from './generate-parameters';

type Version<TVersion extends string> = ExtractApiVersion<TVersion, GetBookmarkApiVersion>;

/**
 * Provides a function to retrieve a bookmark from the server.
 *
 * @param client - The HTTP client to use for the request.
 * @param version - The API version to use for the request.
 * @param method - The HTTP method to use for the request (default is 'json').
 * @returns A function that can be called to execute the bookmark retrieval request.
 */
export const getBookmark = <
    TVersion extends GetBookmarkApiVersion = GetBookmarkApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
>(
    version: TVersion,
    client: IHttpClient,
    method: TMethod = 'json' as TMethod,
) => {
    const apiVersion = extractApiVersion<GetBookmarkApiVersion>(version);
    const execute = client[method];
    return <
        TResponse = GetBookmarkResponse<Version<TVersion>>,
        TResult = GetBookmarkResult<Version<TVersion>, TMethod, TResponse>,
    >(
        args: GetBookmarkRequest<TVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => execute(...generateParameters(apiVersion, args, init)) as TResult;
};

export default getBookmark;
