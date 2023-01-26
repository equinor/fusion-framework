import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { generateParameters } from './generate-parameters';
import { ApiVersions, GetBookmarkArgs, GetBookmarkResult, GetBookmarksResult } from './types';

/**
 * Method for fetching bookmark by it`s id from bookmark service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const getBookmark =
    <
        TVersion extends ApiVersions = ApiVersions,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod
    ) =>
    <TResult = GetBookmarkResult<TVersion, unknown>>(
        args: GetBookmarkArgs<TVersion>,
        init?: ClientRequestInit<TClient, TResult>
    ): GetBookmarksResult<TVersion, TMethod, unknown, TResult> =>
        client[method](
            ...generateParameters<TResult, TVersion, TClient>(version, args, init)
        ) as GetBookmarksResult<TVersion, TMethod, unknown, TResult>;

export default getBookmark;
