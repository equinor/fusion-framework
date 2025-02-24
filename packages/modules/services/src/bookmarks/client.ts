import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod } from '../types';

import {
  type GetBookmarksArgs,
  type GetBookmarksResponse,
  type GetBookmarksResult,
  type GetBookmarksVersion,
  getBookmarks,
} from './endpoints/user-bookmarks.get';

import {
  type GetBookmarkArg,
  type GetBookmarkResponse,
  type GetBookmarkResult,
  type GetBookmarkVersion,
  getBookmark,
} from './endpoints/bookmark.get';

import {
  type CreateBookmarkArg,
  type CreateBookmarkResponse,
  type CreateBookmarkVersion,
  type CreateBookmarksResult,
  createBookmark,
} from './endpoints/bookmark.post';
import {
  type PatchBookmarkArg,
  type PatchBookmarkResponse,
  type PatchBookmarkVersion,
  type PatchBookmarksResult,
  patchBookmark,
} from './endpoints/bookmark.patch';

import {
  type BookmarkApplyArgs,
  type BookmarkApplyResponse,
  type BookmarkApplyResult,
  type BookmarkApplyVersion,
  getBookmarkApply,
} from './endpoints/bookmark-apply.get';
import {
  type AddBookmarkFavouriteArgs,
  type AddBookmarkFavouriteResponse,
  type AddBookmarkFavouriteResult,
  type AddBookmarkFavouriteVersion,
  addBookmarkAsFavourite,
} from './endpoints/user-bookmark-favourite.post';
import {
  type DeleteBookmarkArg,
  type DeleteBookmarkResponse,
  type DeleteBookmarkVersion,
  deleteBookmark,
} from './endpoints/bookmark.delete';
import {
  type IsFavoriteBookmarkArgs,
  type IsFavoriteBookmarkResponse,
  type IsFavoriteBookmarkResult,
  type IsFavoriteBookmarkVersion,
  isFavoriteBookmark,
} from './endpoints/user-bookmark-favourite.head';
import {
  type RemoveBookmarkFavouriteArgs,
  type RemoveBookmarkFavouriteResponse,
  type RemoveBookmarkFavouriteResult,
  type RemoveBookmarkFavouriteVersion,
  removeFavoriteBookmark,
} from './endpoints/user-bookmark-favourite.delete';

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
 * const bookmarks = await client.query();
 *
 * // update a bookmark by its ID
 * await client.patch({
 *  bookmarkId: 'my-bookmark-id',
 *  data: {
 *     name: 'new-name'
 *     payload: { foo: 'bar' }
 *  }
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
   * @param args - Additional parameters to pass to the `getBookmark` function
   * @returns The result of the `getBookmark` function
   */
  public get<TVersion extends GetBookmarkVersion, TResponse = GetBookmarkResponse<TVersion>>(
    version: TVersion,
    args: GetBookmarkArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): GetBookmarkResult<TVersion, TMethod, TResponse> {
    const fn = getBookmark(version, this._client, this._method);
    return fn(args, init);
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
    TVersion extends BookmarkApplyVersion,
    TResponse = BookmarkApplyResponse<TVersion>,
  >(
    version: TVersion,
    args: BookmarkApplyArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): BookmarkApplyResult<TVersion, TMethod, TResponse> {
    const fn = getBookmarkApply(version, this._client, this._method);
    return fn(args, init);
  }

  /**
   * Query a person's bookmarks.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `getBookmarks` function.
   * @param version - The API version to use.
   * @param args - Additional arguments to pass to the `getBookmarks` function.
   * @param init - Optional request initialization options.
   * @returns The result of calling the `getBookmarks` function.
   */
  public query<TVersion extends GetBookmarksVersion, TResponse = GetBookmarksResponse<TVersion>>(
    version: TVersion,
    args?: GetBookmarksArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): GetBookmarksResult<TVersion, TMethod, TResponse> {
    const fn = getBookmarks(version, this._client, this._method);
    return fn(args, init);
  }

  /**
   * Update a bookmark
   *
   * @template TVersion - The version of the API to call
   * @template TResponse - The type of the result of the `patchBookmark` function
   * @param version - The API version to use
   * @param args - The parameters to pass to the `patchBookmark` function
   * @returns The result of the `patchBookmark` function
   */
  public patch<TVersion extends PatchBookmarkVersion, TResponse = PatchBookmarkResponse<TVersion>>(
    version: TVersion,
    args: PatchBookmarkArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): PatchBookmarksResult<TVersion, TMethod, TResponse> {
    const fn = patchBookmark(version, this._client, this._method);
    return fn(args, init);
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
    TVersion extends CreateBookmarkVersion,
    TResponse = CreateBookmarkResponse<TVersion>,
  >(
    version: TVersion,
    request: CreateBookmarkArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): CreateBookmarksResult<TVersion, TMethod, TResponse> {
    const fn = createBookmark(version, this._client, this._method);
    return fn(request, init);
  }

  /**
   * Deletes a bookmark.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `deleteBookmark` function.
   * @param version - The version of the delete bookmark API to use.
   * @param args - The arguments to pass to the `deleteBookmark` function.
   * @returns The result of the delete bookmark operation.
   */
  public delete<
    TVersion extends DeleteBookmarkVersion,
    TResponse = DeleteBookmarkResponse<TVersion>,
  >(
    version: TVersion,
    args: DeleteBookmarkArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): GetBookmarkResult<TVersion, TMethod, TResponse> {
    const fn = deleteBookmark(version, this._client, this._method);
    return fn(args, init);
  }

  /**
   * Check if a bookmark is a favorite.
   *
   * @template TVersion - The version of the API to call.
   * @template TResult - The type of the result of the `verifyBookmarkFavorite` function.
   * @param version - The API version to use.
   * @param args - The arguments to pass to the `HeadBookmarkFavoriteFn` function.
   * @returns The result of the `HeadBookmarksFavoriteResult` function.
   */
  public isFavorite<
    TVersion extends IsFavoriteBookmarkVersion,
    TResponse = IsFavoriteBookmarkResponse<TVersion>,
  >(
    version: TVersion,
    args: IsFavoriteBookmarkArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): IsFavoriteBookmarkResult<TVersion, TMethod, TResponse> {
    const fn = isFavoriteBookmark(version, this._client, this._method);
    return fn(args, init);
  }

  /**
   * Add the provided bookmark to the user's favorites.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `addBookmarkFavorite` function.
   * @param version - The API version to use.
   * @param args - The parameters to pass to the `PostBookmarkFavoriteFn` function.
   * @returns The result of adding the bookmark to the user's favorites.
   */
  public addFavourite<
    TVersion extends AddBookmarkFavouriteVersion,
    TResponse = AddBookmarkFavouriteResponse<TVersion>,
  >(
    version: TVersion,
    args: AddBookmarkFavouriteArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): AddBookmarkFavouriteResult<TVersion, TMethod, TResponse> {
    const fn = addBookmarkAsFavourite(version, this._client, this._method);
    return fn(args, init);
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
    TVersion extends RemoveBookmarkFavouriteVersion,
    TResponse = RemoveBookmarkFavouriteResponse<TVersion>,
  >(
    version: TVersion,
    request: RemoveBookmarkFavouriteArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): RemoveBookmarkFavouriteResult<TVersion, TMethod, TResponse> {
    const fn = removeFavoriteBookmark(version, this._client, this._method);
    return fn(request, init);
  }
}

export default BookmarksApiClient;
