import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from '../types';

import { ApiVersion } from '../static';

/**
 * Defines the API models for adding a favourite bookmark.
 */
export type AddFavouriteBookmarkApiModels = {
    [ApiVersion.v1]: { request: { bookmarkId: string }; response: undefined };
};

/**
 * The API version for adding a favourite bookmark.
 * This type represents the allowed API versions for the "add favourite bookmark" operation.
 */
export type AddFavouriteBookmarkApiVersion = FilterAllowedApiVersions<
    keyof AddFavouriteBookmarkApiModels
>;

/**
 * Represents the response type for the "AddFavouriteBookmark" API operation, which varies based on the API version.
 *
 * @template TVersion - The API version for which the response type is defined.
 */
export type AddFavouriteBookmarkResponse<TVersion extends AddFavouriteBookmarkApiVersion> =
    AddFavouriteBookmarkApiModels[ExtractApiVersion<TVersion>]['response'];

/**
 * Represents the request type for the "AddFavouriteBookmark" API operation, which varies based on the API version.
 *
 * @template TVersion - The API version for which the response type is defined.
 */
export type AddFavouriteBookmarkRequest<TVersion extends AddFavouriteBookmarkApiVersion> =
    AddFavouriteBookmarkApiModels[ExtractApiVersion<TVersion>]['request'];

/**
 * Represents the result of adding a favourite bookmark,
 *
 * @template TVersion - The API version.
 * @template TMethod - The method name on the `ClientMethod` type.
 * @template TResult - The result type.
 */
export type AddFavouriteBookmarkResult<
    TVersion extends AddFavouriteBookmarkApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = AddFavouriteBookmarkResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
