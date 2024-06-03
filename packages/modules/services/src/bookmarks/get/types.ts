import type { ApiBookmark } from '../api-models';
import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from '../types';

import { ApiVersion } from '../static';

/**
 * Defines the API models for the "get" endpoint of the bookmarks service.
 */
export type GetBookmarkApiModels = {
    [ApiVersion.v1]: { request: { bookmarkId: string }; response: ApiBookmark<ApiVersion.v1> };
};

/**
 * The API version type for the "get bookmarks" API endpoint.
 */
export type GetBookmarkApiVersion = FilterAllowedApiVersions<keyof GetBookmarkApiModels>;

/**
 * Represents the response type for the `GetBookmark` API operation.
 *
 * @template TVersion - The API version for which the response type is defined.
 */
export type GetBookmarkResponse<TVersion extends GetBookmarkApiVersion> =
    GetBookmarkApiModels[ExtractApiVersion<TVersion>]['response'];

/**
 * Represents the request type for the `GetBookmark` API endpoint.
 *
 * @template TVersion - The API version for which the response type is defined.
 */
export type GetBookmarkRequest<TVersion extends GetBookmarkApiVersion> =
    GetBookmarkApiModels[ExtractApiVersion<TVersion>]['request'];

/**
 * Represents the result of fetching a bookmark using a client method.
 *
 * @template TVersion - The version of the AddFavouriteBookmarkApi to use.
 * @template TMethod - The method on the ClientMethod interface to use for the GetBookmark operation.
 * @template TResult - The type of the GetBookmarkResponse to return.
 */
export type GetBookmarkResult<
    TVersion extends GetBookmarkApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = GetBookmarkResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
