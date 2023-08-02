import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { generateParameters } from './generate-parameters';
import { ApiVersions, PostBookmarkArgs, PostBookmarkResult, PostBookmarksResult } from './types';

/**
 * Method for fetching bookmark by it`s id from bookmark service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const postBookmark =
    <
        TVersion extends ApiVersions = ApiVersions,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod,
    ) =>
    <TResult = PostBookmarkResult<TVersion, unknown>>(
        args: PostBookmarkArgs<TVersion>,
        init?: ClientRequestInit<TClient, TResult>,
    ): PostBookmarksResult<TVersion, TMethod, unknown, TResult> =>
        client[method](
            ...generateParameters<TResult, TVersion, TClient>(version, args, init),
        ) as PostBookmarksResult<TVersion, TMethod, unknown, TResult>;

export default postBookmark;
