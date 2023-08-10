import { ApiBookmarkEntityV1 } from '../api-models';
import { ClientMethod } from '../types';

/**Gets result type for GetAllBookmark call based on version and method */
export type GetAllBookmarksResult<
    TVersion extends ApiVersions,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TPayload = unknown,
    TResult = GetAllBookmarkResult<TVersion, TPayload>,
> = ClientMethod<TResult>[TMethod];

export type GetAllBookmarkResult<
    TVersion extends ApiVersions,
    TPayload,
> = GetAllBookmarksVersions<TPayload>[TVersion]['result'];

export type GetAllBookmarksVersions<TPayload = unknown> = {
    ['v1']: { result: Array<ApiBookmarkEntityV1<TPayload>> };
};

export type ApiVersions = keyof GetAllBookmarksVersions<unknown>;
