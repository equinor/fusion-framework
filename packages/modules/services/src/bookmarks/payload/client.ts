import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod, ExtractApiVersion } from '../types';
import type {
    GetBookmarkPayloadApiVersion,
    GetBookmarkPayloadRequest,
    GetBookmarkPayloadResult,
    GetBookmarkPayloadResponse,
} from './types';

import { extractApiVersion } from '../utils';
import { generateParameters } from './generate-parameters';

type Version<TVersion extends string> = ExtractApiVersion<TVersion, GetBookmarkPayloadApiVersion>;

/**
 * Generates a bookmark payload using the provided HTTP client, API version, and method.
 *
 * @param client - The HTTP client to use for the request.
 * @param version - The API version to use.
 * @param method - The HTTP method to use for the request (default is 'json').
 * @returns A function that can be called with bookmark payload arguments to execute the request and return the result.
 */
export const getBookmarkPayload = <
    TVersion extends GetBookmarkPayloadApiVersion = GetBookmarkPayloadApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
>(
    version: TVersion,
    client: IHttpClient,
    method: TMethod = 'json' as TMethod,
) => {
    const apiVersion = extractApiVersion<GetBookmarkPayloadApiVersion>(version);
    const execute = client[method];
    return <
        TResponse = GetBookmarkPayloadResponse<Version<TVersion>>,
        TResult = GetBookmarkPayloadResult<Version<TVersion>, TMethod, TResponse>,
    >(
        request: GetBookmarkPayloadRequest<TVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => execute(...generateParameters(apiVersion, request, init)) as TResult;
};
