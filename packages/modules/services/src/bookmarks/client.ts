import { IHttpClient } from '@equinor/fusion-framework-module-http';

import { ClientMethod } from '@equinor/fusion-framework-module-services/context';
import deleteBookmark from './delete/client';
import { DeleteBookmarkResult, DeleteBookmarksFn, DeleteBookmarksResult } from './delete/types';
import getBookmark from './get/client';
import { ApiVersions, GetBookmarkResult, GetBookmarksFn, GetBookmarksResult } from './get/types';
import { PostBookmarkResult, PostBookmarkFn, PostBookmarksResult } from './post/types';
import postBookmark from './post/client';
import patchBookmark, { PatchBookmarkFn, PatchBookmarkResult, PatchBookmarksResult } from './patch';
import getAllBookmarks, { GetAllBookmarkResult, GetAllBookmarksResult } from './getAll';
import addBookmarkFavorite, {
    PostBookmarkFavoriteFn,
    PostBookmarksFavoriteResult,
} from './favorites/post';
import deleteBookmarkFavorite, {
    DeleteBookmarksFavoriteFn,
    DeleteBookmarksFavoriteResult,
} from './favorites/delete';
import verifyBookmarkFavorite, {
    HeadBookmarkFavoriteFn,
    HeadBookmarksFavoriteResult,
} from './favorites/head';

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
        const fn = getBookmark(this._client, version, this._method);
        return fn<TResult>(...args);
    }
    /**
     * Fetch all bookmarks
     * @see {@link get/client}
     */
    public getAll<TVersion extends ApiVersions, TResult = GetAllBookmarkResult<TVersion, TPayload>>(
        version: TVersion
    ): GetAllBookmarksResult<TVersion, TMethod, TPayload, TResult> {
        const fn = getAllBookmarks(this._client, version, this._method);
        return fn<TResult>();
    }

    /**
     * Create a new bookmark
     * @see {@link get/client}
     */
    public post<TVersion extends ApiVersions, TResult = PostBookmarkResult<TVersion, TPayload>>(
        version: TVersion,
        ...args: Parameters<PostBookmarkFn<TVersion, TMethod, TClient, TPayload, TResult>>
    ): PostBookmarksResult<TVersion, TMethod, TPayload, TResult> {
        const fn = postBookmark(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    /**
     * Update a bookmark
     * @see {@link get/client}
     */
    public patch<TVersion extends ApiVersions, TResult = PatchBookmarkResult<TVersion, TPayload>>(
        version: TVersion,
        ...args: Parameters<PatchBookmarkFn<TVersion, TMethod, TClient, TPayload, TResult>>
    ): PatchBookmarksResult<TVersion, TMethod, TPayload, TResult> {
        const fn = patchBookmark(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    /**
     * Delete a bookmark
     * @see {@link delete/client}
     */
    public delete<TVersion extends ApiVersions, TResult = DeleteBookmarkResult<TVersion>>(
        version: TVersion,
        ...args: Parameters<DeleteBookmarksFn<TVersion, TMethod, TClient, TResult>>
    ): DeleteBookmarksResult<TVersion, TMethod, TResult> {
        const fn = deleteBookmark(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    /**
     * Add bookmark to favorites by bookmark id
     * @see {@link addFavorite/client}
     */
    public addFavorite<TVersion extends ApiVersions, TResult = DeleteBookmarkResult<TVersion>>(
        version: TVersion,
        ...args: Parameters<PostBookmarkFavoriteFn<TVersion, TMethod, TClient, TResult>>
    ): PostBookmarksFavoriteResult<TVersion, TMethod, TResult> {
        const fn = addBookmarkFavorite(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    /**
     *
     * Remove bookmark from favorites by bookmark id
     * @see {@link removeFavorite/client}
     */
    public removeFavorite<TVersion extends ApiVersions, TResult = DeleteBookmarkResult<TVersion>>(
        version: TVersion,
        ...args: Parameters<DeleteBookmarksFavoriteFn<TVersion, TMethod, TClient, TResult>>
    ): DeleteBookmarksFavoriteResult<TVersion, TMethod, TResult> {
        const fn = deleteBookmarkFavorite(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    /**
     *
     * Verify that the current bookmark is present in the users collection of bookmarks.
     * @see {@link verifyFavorite/client}
     */
    public verifyFavorite<TVersion extends ApiVersions, TResult = DeleteBookmarkResult<TVersion>>(
        version: TVersion,
        ...args: Parameters<HeadBookmarkFavoriteFn<TVersion, TMethod, TClient, TResult>>
    ): HeadBookmarksFavoriteResult<TVersion, TMethod, TResult> {
        const fn = verifyBookmarkFavorite(this._client, version, this._method);
        return fn<TResult>(...args);
    }
}

export default BookmarksApiClient;
