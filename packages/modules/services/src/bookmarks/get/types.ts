import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { ApiBookmarkEntityV1 } from '../api-models';

export type GetBookmarkResult<
    TVersion extends ApiVersions,
    TPayload,
> = GetBookmarksVersions<TPayload>[TVersion]['result'];

/** Returns args for GetBookmark based on version*/
export type GetBookmarkArgs<TVersion extends ApiVersions> = GetBookmarksVersions[TVersion]['args'];

/**Gets result type for GetBookmark call based on version and method */
export type GetBookmarksResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TPayload = unknown,
    TResult = GetBookmarkResult<TVersion, TPayload>,
> = ClientMethod<TResult>[TMethod];

export type GetBookmarksFn<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TPayload = unknown,
    TResult = GetBookmarkResult<TVersion, TPayload>,
> = (
    args: GetBookmarkArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => GetBookmarksResult<TVersion, TMethod, TPayload, TResult>;

type GetBookmarksArgsV1 = { id: string };

export type GetBookmarksVersions<TPayload = unknown> = {
    ['v1']: { args: GetBookmarksArgsV1; result: ApiBookmarkEntityV1<TPayload> };
};

export type ApiVersions = keyof GetBookmarksVersions<unknown>;
