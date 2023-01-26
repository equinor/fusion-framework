import { IHttpClient } from '@equinor/fusion-framework-module-http';

import { ClientMethod } from '@equinor/fusion-framework-module-services/context';
import deleteBookmark from './delete/client';
import { DeleteBookmarkResult, DeleteBookmarksFn, DeleteBookmarksResult } from './delete/types';
import getBookmark from './get/client';
import { ApiVersions, GetBookmarkResult, GetBookmarksFn, GetBookmarksResult } from './get/types';
import { PostBookmarkResult, PostBookmarkFn, PostBookmarksResult } from './post/types';
import postBookmark from './post/client';

export class BookmarksApiClient<
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TPayload = unknown
> {
    constructor(protected _client: TClient, protected _method: TMethod) {}

    /**
     * Fetch bookmark by id
     * @see {@link get/client}
     */
    public get<TVersion extends ApiVersions, TResult = GetBookmarkResult<TVersion, TPayload>>(
        version: TVersion,
        ...args: Parameters<GetBookmarksFn<TVersion, TMethod, TClient, TPayload, TResult>>
    ): GetBookmarksResult<TVersion, TMethod, TPayload, TResult> {
        const fn = getBookmark<TVersion, TMethod, TClient>(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    /**
     * Create a new bookmark
     * @see {@link get/client}
     */
    public post<TVersion extends ApiVersions, TResult = PostBookmarkResult<TVersion, TPayload>>(
        version: TVersion,
        ...args: Parameters<PostBookmarkFn<TVersion, TMethod, TClient, TPayload, TResult>>
    ): PostBookmarksResult<TVersion, TMethod, TPayload, TResult> {
        const fn = postBookmark<TVersion, TMethod, TClient>(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    public delete<TVersion extends ApiVersions, TResult = DeleteBookmarkResult<TVersion>>(
        version: TVersion,
        ...args: Parameters<DeleteBookmarksFn<TVersion, TMethod, TClient, TResult>>
    ): DeleteBookmarksResult<TVersion, TMethod, TResult> {
        const fn = deleteBookmark(this._client, version, this._method);
        return fn<TResult>(...args);
    }
}

export default BookmarksApiClient;
