import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod } from '../..';

import { generateParameters } from './generate-parameters';
import type { ApiVersions, GetAllBookmarkResult, GetAllBookmarksResult } from './types';

/**
 * Method for fetching all bookmarks for the current user from bookmark service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const getAllBookmarks =
    <
        TVersion extends ApiVersions = ApiVersions,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod,
    ) =>
    <TResult = GetAllBookmarkResult<TVersion, unknown>>(
        init?: ClientRequestInit<TClient, TResult>,
    ): GetAllBookmarksResult<TVersion, TMethod, unknown, TResult> =>
        client[method](
            ...generateParameters<TResult, TVersion, TClient>(version, init),
        ) as GetAllBookmarksResult<TVersion, TMethod, unknown, TResult>;

export default getAllBookmarks;
