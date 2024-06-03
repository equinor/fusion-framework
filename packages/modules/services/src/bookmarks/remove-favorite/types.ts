import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from '../types';

import { ApiVersion } from '../static';

/**
 * Defines the API models for removing a favorite bookmark.
 */
export type RemoveFavouriteBookmarkApiModels = {
    [ApiVersion.v1]: { request: { bookmarkId: string }; response: undefined };
};

/**
 * The API version for remove a favorite bookmark.
 * This type represents the allowed API versions for the "remove a favorite bookmark" operation.
 */
export type RemoveFavouriteBookmarkApiVersion = FilterAllowedApiVersions<
    keyof RemoveFavouriteBookmarkApiModels
>;

/**
 * The response type for the API endpoint for removing a favorite bookmark,
 * which varies based on the API version.
 */
export type RemoveFavouriteBookmarkResponse<TVersion extends RemoveFavouriteBookmarkApiVersion> =
    RemoveFavouriteBookmarkApiModels[ExtractApiVersion<TVersion>]['response'];

/**
 * The request type for the API endpoint for removing a favorite bookmark,
 * which varies based on the API version.
 */
export type RemoveFavouriteBookmarkRequest<TVersion extends RemoveFavouriteBookmarkApiVersion> =
    RemoveFavouriteBookmarkApiModels[ExtractApiVersion<TVersion>]['request'];

/**
 * The result of removing a favorite bookmark,
 * which varies based on the API version.
 */
export type RemoveFavouriteBookmarkResult<
    TVersion extends RemoveFavouriteBookmarkApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = RemoveFavouriteBookmarkResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
