import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { generateParameters } from './generate-parameters';
import { ApiVersions, PutBookmarkArgs, PutBookmarkResult, PutBookmarksResult } from './types';

/**
 * Method for updating bookmark
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const putBookmark =
    <
        TClient extends IHttpClient = IHttpClient,
        TVersion extends ApiVersions = ApiVersions,
        TMethod extends keyof ClientMethod = keyof ClientMethod
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod
    ) =>
    <TResult = PutBookmarkResult<TVersion, unknown>>(
        args: PutBookmarkArgs<TVersion>,
        init?: ClientRequestInit<TClient, TResult>
    ): PutBookmarksResult<TVersion, TMethod, unknown, TResult> =>
        client[method](
            ...generateParameters<TResult, TVersion, TClient>(version, args, init)
        ) as PutBookmarksResult<TVersion, TMethod, unknown, TResult>;

export default putBookmark;
