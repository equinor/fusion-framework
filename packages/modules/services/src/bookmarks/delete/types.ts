import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from '../types';

import { ApiVersion } from '../static';

/**
 * Defines the API models for deleting bookmarks.
 *
 * The `DeleteBookmarksApiModels` type is an object that maps API versions to their corresponding request and response types.
 */
export type DeleteBookmarkApiModels = {
    [ApiVersion.v1]: { request: { bookmarkId: string }; response: boolean };
};

/**
 * A type representing the allowed API versions for the DeleteBookmarksApiModels.
 */
export type DeleteBookmarkApiVersion = FilterAllowedApiVersions<keyof DeleteBookmarkApiModels>;

/**
 * Represents the response type for deleting a bookmark.
 * The actual response type is determined by the API version specified in the generic type parameter `TVersion`.
 */
export type DeleteBookmarkResponse<TVersion extends DeleteBookmarkApiVersion> =
    DeleteBookmarkApiModels[ExtractApiVersion<TVersion>]['response'];

/**
 * Represents the request type for deleting a bookmark.
 * The specific request shape depends on the API version provided as a type parameter.
 */
export type DeleteBookmarkRequest<TVersion extends DeleteBookmarkApiVersion> =
    DeleteBookmarkApiModels[ExtractApiVersion<TVersion>]['request'];

/**
 * Represents the result of deleting bookmarks using a client method.
 *
 * @template TVersion - The API version to use.
 * @template TMethod - The client method to use for the deletion operation.
 * @template TResult - The expected response type for the deletion operation.
 */
export type DeleteBookmarkResult<
    TVersion extends DeleteBookmarkApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = DeleteBookmarkResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
