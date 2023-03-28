import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { generateParameters } from './generate-parameters';
import {
    ApiVersions,
    PostBookmarkFavoritesArgs,
    PostBookmarkFavoritesResult,
    PostBookmarksFavoritesResult,
} from './types';

/**
 * Method for adding other users bookmark to your favorites.
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const addBookmarkFavorite =
    <
        TVersion extends ApiVersions = ApiVersions,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod
    ) =>
    <TResult = PostBookmarkFavoritesResult<TVersion>>(
        args: PostBookmarkFavoritesArgs<TVersion>,
        init?: ClientRequestInit<TClient, TResult>
    ): PostBookmarksFavoritesResult<TVersion, TMethod, TResult> =>
        client[method](
            ...generateParameters<TResult, TVersion, TClient>(version, args, init)
        ) as PostBookmarksFavoritesResult<TVersion, TMethod, TResult>;

export default addBookmarkFavorite;
