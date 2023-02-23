import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { ApiBookmarkEntityV1 } from '../api-models';
import { PostBookmarksArgsV1 } from '../post';

export type PutBookmarkResult<
    TVersion extends ApiVersions,
    TPayload
> = PutBookmarksVersions<TPayload>[TVersion]['result'];

/** Returns args for PutBookmark based on version*/
export type PutBookmarkArgs<
    TVersion extends ApiVersions,
    TPayload = unknown
> = PutBookmarksVersions<TPayload>[TVersion]['args'];

/**Gets result type for PutBookmark call based on version and method */
export type PutBookmarksResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TPayload = unknown,
    TResult = PutBookmarkResult<TVersion, TPayload>
> = ClientMethod<TResult>[TMethod];

export type PutBookmarkFn<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TPayload = unknown,
    TResult = PutBookmarkResult<TVersion, TPayload>
> = (
    args: PutBookmarkArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => PutBookmarksResult<TVersion, TMethod, TPayload, TResult>;

export interface PutBookmarksArgsV1<T = unknown> extends PostBookmarksArgsV1<T> {
    id: string;
}

export type PutBookmarksVersions<TPayload = unknown> = {
    ['v1']: { args: PutBookmarksArgsV1<TPayload>; result: ApiBookmarkEntityV1<TPayload> };
};

export type ApiVersions = keyof PutBookmarksVersions<unknown>;
