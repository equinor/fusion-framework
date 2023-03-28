import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';

export type HeadBookmarkFavoriteResult<TVersion extends ApiVersions> =
    HeadBookmarksFavoriteVersions[TVersion]['result'];

export type HeadBookmarkFavoriteArgs<TVersion extends ApiVersions> =
    HeadBookmarksFavoriteVersions[TVersion]['args'];

export type HeadBookmarksFavoriteResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = HeadBookmarkFavoriteResult<TVersion>
> = ClientMethod<TResult>[TMethod];

export type HeadBookmarkFavoriteFn<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = HeadBookmarkFavoriteResult<TVersion>
> = (
    args: HeadBookmarkFavoriteArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => HeadBookmarksFavoriteResult<TVersion, TMethod, TResult>;

export interface HeadBookmarksFavoriteArgsV1 {
    bookmarkId: string;
}

export type HeadBookmarksFavoriteVersions = {
    ['v1']: { args: HeadBookmarksFavoriteArgsV1; result: Response };
};

export type ApiVersions = keyof HeadBookmarksFavoriteVersions;
