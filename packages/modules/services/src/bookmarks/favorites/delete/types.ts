import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { DeleteBookmarksFavoriteArgsV1 } from './types-v1';

export type DeleteBookmarkFavoriteResult<TVersion extends ApiVersions> =
    DeleteBookmarksFavoriteVersions[TVersion]['result'];

export type DeleteBookmarkFavoriteArgs<TVersion extends ApiVersions> =
    DeleteBookmarksFavoriteVersions[TVersion]['args'];

export type DeleteBookmarksFavoriteResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = DeleteBookmarkFavoriteResult<TVersion>,
> = ClientMethod<TResult>[TMethod];

export type DeleteBookmarksFavoriteFn<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = DeleteBookmarkFavoriteResult<TVersion>,
> = (
    args: DeleteBookmarkFavoriteArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => DeleteBookmarksFavoriteResult<TVersion, TMethod, TResult>;

export type DeleteBookmarksFavoriteVersions = {
    ['v1']: { args: DeleteBookmarksFavoriteArgsV1; result: undefined };
};

/**Api versions for bookmarks service */
export type ApiVersions = keyof DeleteBookmarksFavoriteVersions;
