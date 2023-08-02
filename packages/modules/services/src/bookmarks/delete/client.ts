import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { generateParameters } from './generate-parameters';
import {
    ApiVersions,
    DeleteBookmarkArgs,
    DeleteBookmarkResult,
    DeleteBookmarksResult,
} from './types';

/**
 * Method for fetching bookmark by it`s id from bookmark service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const deleteBookmark =
    <
        TVersion extends ApiVersions = ApiVersions,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'fetch' as TMethod,
    ) =>
    <TResult = DeleteBookmarkResult<TVersion>>(
        args: DeleteBookmarkArgs<TVersion>,
        init?: ClientRequestInit<TClient, TResult>,
    ): DeleteBookmarksResult<TVersion, TMethod, TResult> =>
        client[method](
            ...generateParameters<TResult, TVersion, TClient>(version, args, init),
        ) as DeleteBookmarksResult<TVersion, TMethod, TResult>;

export default deleteBookmark;
