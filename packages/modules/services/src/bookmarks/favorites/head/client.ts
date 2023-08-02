import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { generateParameters } from './generate-parameters';
import {
    ApiVersions,
    HeadBookmarkFavoriteArgs,
    HeadBookmarkFavoriteResult,
    HeadBookmarksFavoriteResult,
} from './types';

/**
 * Verify that the bookmark is owned by the current user.
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const verifyBookmarkFavorite =
    <
        TVersion extends ApiVersions = ApiVersions,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod,
    ) =>
    <TResult = HeadBookmarkFavoriteResult<TVersion>>(
        args: HeadBookmarkFavoriteArgs<TVersion>,
        init?: ClientRequestInit<TClient, TResult>,
    ): HeadBookmarksFavoriteResult<TVersion, TMethod, TResult> =>
        client[method](
            ...generateParameters<TResult, TVersion, TClient>(version, args, init),
        ) as HeadBookmarksFavoriteResult<TVersion, TMethod, TResult>;

export default verifyBookmarkFavorite;
