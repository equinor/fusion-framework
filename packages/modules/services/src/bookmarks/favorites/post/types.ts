import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';

export type PostBookmarkFavoritesResult<TVersion extends ApiVersions> =
    PostBookmarksFavoritesVersions[TVersion]['result'];

export type PostBookmarkFavoritesArgs<TVersion extends ApiVersions> =
    PostBookmarksFavoritesVersions[TVersion]['args'];

export type PostBookmarksFavoritesResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = PostBookmarkFavoritesResult<TVersion>
> = ClientMethod<TResult>[TMethod];

export type PostBookmarkFavoritesFn<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = PostBookmarkFavoritesResult<TVersion>
> = (
    args: PostBookmarkFavoritesArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => PostBookmarksFavoritesResult<TVersion, TMethod, TResult>;

export interface PostBookmarksFavoritesArgsV1 {
    bookmarkId: string;
}

export type PostBookmarksFavoritesVersions = {
    ['v1']: { args: PostBookmarksFavoritesArgsV1; result: Response };
};

export type ApiVersions = keyof PostBookmarksFavoritesVersions;
