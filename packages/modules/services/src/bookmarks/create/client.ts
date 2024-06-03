import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod, ExtractApiVersion } from '../types';
import type {
    CreateBookmarkApiVersion,
    CreateBookmarkRequest,
    CreateBookmarkResponse,
    CreateBookmarkResult,
} from './types';

import { extractApiVersion } from '../utils';
import { generateParameters } from './generate-parameters';

type Version<TVersion extends string> = ExtractApiVersion<TVersion, CreateBookmarkApiVersion>;


/**
 * Creates a new bookmark using the specified API version, HTTP client, and request method.
 *
 * @param version - The API version to use for the bookmark creation request.
 * @param client - The HTTP client to use for the bookmark creation request.
 * @param method - The request method to use for the bookmark creation request (default is 'json').
 * @returns A function that can be used to execute the bookmark creation request with the specified parameters.
 */
export const createBookmark = <
    TVersion extends CreateBookmarkApiVersion = CreateBookmarkApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient,
>(
    version: TVersion,
    client: TClient,
    method: TMethod = 'json' as TMethod,
) => {
    const apiVersion = extractApiVersion<CreateBookmarkApiVersion>(version);
    const execute = client[method];
    return <
        TResponse = CreateBookmarkResponse<Version<TVersion>>,
        TResult = CreateBookmarkResult<Version<TVersion>, TMethod, TResponse>,
    >(
        request: CreateBookmarkRequest<TVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => execute(...generateParameters(apiVersion, request, init)) as TResult;
};
