import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod, ExtractApiVersion } from '../types';
import type {
    IsFavoriteBookmarkApiVersion,
    IsFavoriteBookmarkRequest,
    IsFavoriteBookmarkResponse,
    IsFavoriteBookmarkResult,
} from './types';

import { extractApiVersion } from '../utils';
import { generateParameters } from './generate-parameters';

type Version<TVersion extends string> = ExtractApiVersion<TVersion, IsFavoriteBookmarkApiVersion>;

/**
 * Verify that the bookmark is owned by the current user.
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const isFavoriteBookmark = <
    TVersion extends IsFavoriteBookmarkApiVersion = IsFavoriteBookmarkApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
>(
    version: TVersion,
    client: IHttpClient,
    method: TMethod = 'json' as TMethod,
) => {
    const apiVersion = extractApiVersion<IsFavoriteBookmarkApiVersion>(version);
    const execute = client[method];
    return <
        TResponse = IsFavoriteBookmarkResponse<Version<TVersion>>,
        TResult = IsFavoriteBookmarkResult<Version<TVersion>, TMethod, TResponse>,
    >(
        request: IsFavoriteBookmarkRequest<TVersion>,
        init?: ClientRequestInit<IHttpClient, TResponse>,
    ): TResult => execute(...generateParameters(apiVersion, request, init)) as TResult;
};
