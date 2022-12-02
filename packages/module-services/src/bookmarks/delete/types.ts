import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { DeleteBookmarksArgsV1 } from './types-v1';

export type DeleteBookmarkResult<TVersion extends ApiVersions> =
    DeleteBookmarksVersions[TVersion]['result'];

/** Returns args for GetBookmark based on version*/
export type DeleteBookmarkArgs<TVersion extends ApiVersions> =
    DeleteBookmarksVersions[TVersion]['args'];

/**Gets result type for GetBookmark call based on version and method */
export type DeleteBookmarksResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = DeleteBookmarkResult<TVersion>
> = ClientMethod<TResult>[TMethod];

export type DeleteBookmarksFn<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = DeleteBookmarkResult<TVersion>
> = (
    args: DeleteBookmarkArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => DeleteBookmarksResult<TVersion, TMethod, TResult>;

export type DeleteBookmarksVersions = {
    ['v1']: { args: DeleteBookmarksArgsV1; result: undefined };
};

/**Api versions for bookmarks service */
export type ApiVersions = keyof DeleteBookmarksVersions;
