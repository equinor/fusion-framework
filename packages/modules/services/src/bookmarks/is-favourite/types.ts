import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from '../types';

import { ApiVersion } from '../static';

/**
 * Defines the request and response types for the `isFavorite` bookmark API endpoint.
 */
export type IsFavoriteBookmarkModels = {
    [ApiVersion.v1]: { request: { bookmarkId: string }; response: boolean };
};

/**
 * Represents the allowed API versions for the `IsFavoriteBookmark` API.
 */
export type IsFavoriteBookmarkApiVersion = FilterAllowedApiVersions<keyof IsFavoriteBookmarkModels>;

/**
 * Represents the response type for the `isFavoriteBookmark` API endpoint.
 *
 * @template TVersion - The API version of the `isFavoriteBookmark` endpoint.
 */
export type IsFavoriteBookmarkResponse<TVersion extends IsFavoriteBookmarkApiVersion> =
    IsFavoriteBookmarkModels[ExtractApiVersion<TVersion>]['response'];

/**
 * Represents the request type for the `isFavoriteBookmark` API endpoint.
 *
 * @template TVersion - The API version of the `isFavoriteBookmark` endpoint.
 */
export type IsFavoriteBookmarkRequest<TVersion extends IsFavoriteBookmarkApiVersion> =
    IsFavoriteBookmarkModels[ExtractApiVersion<TVersion>]['request'];

/**
 * Represents the result of an `IsFavoriteBookmark` API call, which determines whether a given bookmark is marked as a favorite.
 *
 * @template TVersion - The version of the `IsFavoriteBookmark` API being used.
 * @template TMethod - The method of the `ClientMethod` interface that the `IsFavoriteBookmark` API call is using.
 * @template TResult - The type of the response from the `IsFavoriteBookmark` API call.
 */
export type IsFavoriteBookmarkResult<
    TVersion extends IsFavoriteBookmarkApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = IsFavoriteBookmarkResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
