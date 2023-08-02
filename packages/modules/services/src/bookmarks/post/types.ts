import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../..';
import { ApiBookmarkEntityV1 } from '../api-models';

export type PostBookmarkResult<
    TVersion extends ApiVersions,
    TPayload,
> = PostBookmarksVersions<TPayload>[TVersion]['result'];

/** Returns args for GetBookmark based on version*/
export type PostBookmarkArgs<
    TVersion extends ApiVersions,
    TPayload = unknown,
> = PostBookmarksVersions<TPayload>[TVersion]['args'];

/**Gets result type for GetBookmark call based on version and method */
export type PostBookmarksResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TPayload = unknown,
    TResult = PostBookmarkResult<TVersion, TPayload>,
> = ClientMethod<TResult>[TMethod];

export type PostBookmarkFn<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TPayload = unknown,
    TResult = PostBookmarkResult<TVersion, TPayload>,
> = (
    args: PostBookmarkArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => PostBookmarksResult<TVersion, TMethod, TPayload, TResult>;

export interface PostBookmarksArgsV1<T = unknown> {
    /** Display name of the bookmark */
    name: string;
    description?: string;
    /** Is the bookmark shared with others */
    isShared: boolean;
    /** Name of the app it belongs too, should correspond to a fusion appkey */
    appKey: string;
    contextId?: string;
    /** Any JSON object to store as the bookmark payload */
    payload: T;
    sourceSystem?: {
        identifier?: string;
        name?: string;
        subSystem?: string;
    };
}

export type PostBookmarksVersions<TPayload = unknown> = {
    ['v1']: { args: PostBookmarksArgsV1<TPayload>; result: ApiBookmarkEntityV1<TPayload> };
};

export type ApiVersions = keyof PostBookmarksVersions<unknown>;
