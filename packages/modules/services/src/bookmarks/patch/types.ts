import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { ApiBookmarkEntityV1 } from '../api-models';
import { PostBookmarksArgsV1 } from '../post';

export type PatchBookmarkResult<
    TVersion extends ApiVersions,
    TPayload
> = PatchBookmarksVersions<TPayload>[TVersion]['result'];

/** Returns args for PutBookmark based on version*/
export type PatchBookmarkArgs<
    TVersion extends ApiVersions,
    TPayload = unknown
> = PatchBookmarksVersions<TPayload>[TVersion]['args'];

/**Gets result type for PutBookmark call based on version and method */
export type PatchBookmarksResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TPayload = unknown,
    TResult = PatchBookmarkResult<TVersion, TPayload>
> = ClientMethod<TResult>[TMethod];

export type PatchBookmarkFn<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TPayload = unknown,
    TResult = PatchBookmarkResult<TVersion, TPayload>
> = (
    args: PatchBookmarkArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>
) => PatchBookmarksResult<TVersion, TMethod, TPayload, TResult>;

export interface PatchBookmarksArgsV1<T = unknown> extends Partial<PostBookmarksArgsV1<T>> {
    id: string;
}

export type PatchBookmarksVersions<TPayload = unknown> = {
    ['v1']: { args: PatchBookmarksArgsV1<TPayload>; result: ApiBookmarkEntityV1<TPayload> };
};

export type ApiVersions = keyof PatchBookmarksVersions<unknown>;
