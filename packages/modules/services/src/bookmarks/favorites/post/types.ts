import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';

export type PostBookmarkFavoriteResult<TVersion extends ApiVersions> =
    PostBookmarksFavoriteVersions[TVersion]['result'];

export type PostBookmarkFavoriteArgs<TVersion extends ApiVersions> =
    PostBookmarksFavoriteVersions[TVersion]['args'];

export type PostBookmarksFavoriteResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = PostBookmarkFavoriteResult<TVersion>,
> = ClientMethod<TResult>[TMethod];

export type PostBookmarkFavoriteFn<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = PostBookmarkFavoriteResult<TVersion>,
> = (
    args: PostBookmarkFavoriteArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => PostBookmarksFavoriteResult<TVersion, TMethod, TResult>;

export interface PostBookmarksFavoriteArgsV1 {
    bookmarkId: string;
}

export type PostBookmarksFavoriteVersions = {
    ['v1']: { args: PostBookmarksFavoriteArgsV1; result: Response };
};

export type ApiVersions = keyof PostBookmarksFavoriteVersions;
