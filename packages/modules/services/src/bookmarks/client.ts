import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod } from '../types';

import {
    createBookmark,
    type CreateBookmarkApiVersion,
    type CreateBookmarkRequest,
    type CreateBookmarkResponse,
    type CreateBookmarkResult,
} from './create';

import {
    getBookmark,
    type GetBookmarkApiVersion,
    type GetBookmarkRequest,
    type GetBookmarkResponse,
    type GetBookmarkResult,
} from './get';

import {
    getBookmarkPayload,
    type GetBookmarkPayloadApiVersion,
    type GetBookmarkPayloadRequest,
    type GetBookmarkPayloadResponse,
    type GetBookmarkPayloadResult,
} from './payload';

import {
    getAllBookmarks,
    type GetAllBookmarksResponse,
    type GetAllBookmarksApiVersion,
    type GetAllBookmarksResult,
    type GetAllBookmarksRequest,
} from './getAll';

import {
    patchBookmark,
    type PatchBookmarkRequest,
    type PatchBookmarksApiVersion,
    type PatchBookmarkResponse,
    type PatchBookmarksResult,
} from './patch';

import {
    deleteBookmark,
    type DeleteBookmarkApiVersion,
    type DeleteBookmarkRequest,
    type DeleteBookmarkResponse,
    type DeleteBookmarkResult,
} from './delete';

import {
    addFavouriteBookmark,
    type AddFavouriteBookmarkApiVersion,
    type AddFavouriteBookmarkRequest,
    type AddFavouriteBookmarkResponse,
    type AddFavouriteBookmarkResult,
} from './add-favourite';
import {
    isFavoriteBookmark,
    type IsFavoriteBookmarkRequest,
    type IsFavoriteBookmarkApiVersion,
    type IsFavoriteBookmarkResponse,
    type IsFavoriteBookmarkResult,
} from './is-favourite';

import {
    RemoveFavouriteBookmarkApiVersion,
    RemoveFavouriteBookmarkRequest,
    RemoveFavouriteBookmarkResponse,
    RemoveFavouriteBookmarkResult,
    removeFavouriteBookmark,
} from './remove-favorite';

/**
 * Provides a client interface for interacting with the bookmarks API.
 * This class abstracts the details of making API requests and handling responses.
 * It provides methods for fetching, creating, updating, and deleting bookmarks,
 * as well as managing bookmark favorites.
 *
 * @example
 * ```typescript
 * import { BookmarksApiClient } from '@equinor/fusion';
 * import { HttpClient } from '@equinor/fusion-framework-module-http';
 *
 * const httpClient = new HttpClient({ baseUri: 'https://my-bookmarks-api.com/' });
 *
 * // create a bookmarks API client using a custom HTTP client
 * const client = new BookmarksApiClient(httpClient, 'json');
 *
 * // fetch a bookmark by its ID
 * const bookmark = await client.getBookmark('my-bookmark-id');
 *
 * // fetch all bookmarks for the current user
 * const bookmarks = await client.getAllBookmarks();
 *
 * // update a bookmark by its ID
 * await client.patch({
 *  id: 'my-bookmark-id',
 *  payload: JSON.stringify(data}
 * });
 *
 * // delete a bookmark by its ID
 * await client.deleteBookmark('my-bookmark-id');
 *
 * // add or remove a bookmark to the current user's favorites
 * await client.addFavorite({ bookmarkId:'my-bookmark-id' });
 * await client.removeFavorite({ bookmarkId:'my-bookmark-id' });
 * ```
 *
 * @template TMethod - The client method to use for the request, defaults to 'json'.
 * @template TClient - The HTTP client to use for executing the request.
 */
export class BookmarksApiClient<
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
> {
    /**
     * Constructs a new instance of the BookmarksClient class.
     *
     * @param _client - The client instance to use for making API requests.
     * @param _method - The client method to use for API requests.
     */
    constructor(
        protected _client: TClient,
        protected _method: TMethod,
    ) {}

    /**
     * Fetch a single bookmark
     *
     * @template TVersion - The version of the API to call
     * @template TResponse - The type of the result of the `getBookmark` function
     * @param version - The API version to use
     * @param request - Additional parameters to pass to the `getBookmark` function
     * @returns The result of the `getBookmark` function
     */
    public get<TVersion extends GetBookmarkApiVersion, TResponse = GetBookmarkResponse<TVersion>>(
        version: TVersion,
        request: GetBookmarkRequest<TVersion>,
        init?: ClientRequestInit<TClient, TResponse>,
    ): GetBookmarkResult<TVersion, TMethod, TResponse> {
        const fn = getBookmark(version, this._client, this._method);
        return fn(request, init);
    }

    /**
     * Retrieves the payload for a bookmark using the specified API version.
     *
     * @template TVersion - The version of the API to call.
     * @template TResult - The type of the result of the `getBookmarkPayload` function.
     * @param version - The API version to use for the bookmark payload.
     * @param args - The arguments to pass to the `getBookmarkPayload` function.
     * @returns The result of the `getBookmarkPayload` function.
     */
    public getPayload<
        TVersion extends GetBookmarkPayloadApiVersion,
        TResponse = GetBookmarkPayloadResponse<TVersion>,
    >(
        version: TVersion,
        request: GetBookmarkPayloadRequest<TVersion>,
        init?: ClientRequestInit<TClient, TResponse>,
    ): GetBookmarkPayloadResult<TVersion, TMethod, TResponse> {
        const fn = getBookmarkPayload(version, this._client, this._method);
        return fn(request, init);
    }

    /**
     * Get all bookmarks.
     *
     * @template TVersion - The version of the API to call.
     * @template TResult - The type of the result of the `getAllBookmarks` function.
     * @param version - The API version to use.
     * @param args - Additional arguments to pass to the `getAllBookmarks` function.
     * @returns The result of calling the `getAllBookmarks` function.
     */
    public getAll<
        TVersion extends GetAllBookmarksApiVersion,
        TResponse = GetAllBookmarksResponse<TVersion>,
    >(
        version: TVersion,
        request?: GetAllBookmarksRequest<TVersion>,
        init?: ClientRequestInit<TClient, TResponse>,
    ): GetAllBookmarksResult<TVersion, TMethod, TResponse> {
        const fn = getAllBookmarks(version, this._client, this._method);
        return fn(request, init);
    }

    /**
     * Update a bookmark
     *
     * @template TVersion - The version of the API to call
     * @template TResponse - The type of the result of the `patchBookmark` function
     * @param version - The API version to use
     * @param request - The parameters to pass to the `patchBookmark` function
     * @returns The result of the `patchBookmark` function
     */
    public patch<
        TVersion extends PatchBookmarksApiVersion,
        TResponse = PatchBookmarkResponse<TVersion>,
    >(
        version: TVersion,
        request: PatchBookmarkRequest<TVersion>,
        init?: ClientRequestInit<TClient, TResponse>,
    ): PatchBookmarksResult<TVersion, TMethod, TResponse> {
        const fn = patchBookmark(version, this._client, this._method);
        return fn(request, init);
    }

    /**
     * Create a new bookmark
     *
     * @template TVersion - The version of the API to call
     * @template TResult - The type of the result of the `postBookmark` function
     * @param version - The API version to use
     * @param request - The parameters to pass to the `postBookmark` function
     * @returns The result of creating the bookmark
     */
    public create<
        TVersion extends CreateBookmarkApiVersion,
        TResponse = CreateBookmarkResponse<TVersion>,
    >(
        version: TVersion,
        request: CreateBookmarkRequest<TVersion>,
        init?: ClientRequestInit<TClient, TResponse>,
    ): CreateBookmarkResult<TVersion, TMethod, TResponse> {
        const fn = createBookmark(version, this._client, this._method);
        return fn(request, init);
    }

    /**
     * Deletes a bookmark.
     *
     * @template TVersion - The version of the API to call.
     * @template TResponse - The type of the result of the `deleteBookmark` function.
     * @param version - The version of the delete bookmark API to use.
     * @param request - The arguments to pass to the `deleteBookmark` function.
     * @returns The result of the delete bookmark operation.
     */
    public delete<
        TVersion extends DeleteBookmarkApiVersion,
        TResponse = DeleteBookmarkResponse<TVersion>,
    >(
        version: TVersion,
        request: DeleteBookmarkRequest<TVersion>,
        init?: ClientRequestInit<TClient, TResponse>,
    ): DeleteBookmarkResult<TVersion, TMethod, TResponse> {
        const fn = deleteBookmark(version, this._client, this._method);
        return fn(request, init);
    }

    /**
     * Check if a bookmark is a favorite.
     *
     * @template TVersion - The version of the API to call.
     * @template TResult - The type of the result of the `verifyBookmarkFavorite` function.
     * @param version - The API version to use.
     * @param request - The arguments to pass to the `HeadBookmarkFavoriteFn` function.
     * @returns The result of the `HeadBookmarksFavoriteResult` function.
     */
    public isFavorite<
        TVersion extends IsFavoriteBookmarkApiVersion,
        TResponse = IsFavoriteBookmarkResponse<TVersion>,
    >(
        version: TVersion,
        request: IsFavoriteBookmarkRequest<TVersion>,
        init?: ClientRequestInit<TClient, TResponse>,
    ): IsFavoriteBookmarkResult<TVersion, TMethod, TResponse> {
        const fn = isFavoriteBookmark(version, this._client, this._method);
        return fn(request, init);
    }

    /**
     * Add the provided bookmark to the user's favorites.
     *
     * @template TVersion - The version of the API to call.
     * @template TResponse - The type of the result of the `addBookmarkFavorite` function.
     * @param version - The API version to use.
     * @param request - The parameters to pass to the `PostBookmarkFavoriteFn` function.
     * @returns The result of adding the bookmark to the user's favorites.
     */
    public addFavourite<
        TVersion extends AddFavouriteBookmarkApiVersion,
        TResponse = AddFavouriteBookmarkResponse<TVersion>,
    >(
        version: TVersion,
        request: AddFavouriteBookmarkRequest<TVersion>,
        init?: ClientRequestInit<TClient, TResponse>,
    ): AddFavouriteBookmarkResult<TVersion, TMethod, TResponse> {
        const fn = addFavouriteBookmark(version, this._client, this._method);
        return fn(request, init);
    }

    /**
     * Removes the provided bookmark from the user's collection of bookmarks.
     *
     * @template TVersion - The version of the API to call.
     * @template TResult - The type of the result of the `deleteBookmarkFavorite` function.
     * @param version - The API version to use for the request.
     * @param request - The parameters to pass to the `deleteBookmarkFavorite` function.
     * @returns The result of the `deleteBookmarkFavorite` function.
     */
    public removeFavourite<
        TVersion extends RemoveFavouriteBookmarkApiVersion,
        TResponse = RemoveFavouriteBookmarkResponse<TVersion>,
    >(
        version: TVersion,
        request: RemoveFavouriteBookmarkRequest<TVersion>,
        init?: ClientRequestInit<TClient, TResponse>,
    ): RemoveFavouriteBookmarkResult<TVersion, TMethod, TResponse> {
        const fn = removeFavouriteBookmark(version, this._client, this._method);
        return fn(request, init);
    }
}

export default BookmarksApiClient;
