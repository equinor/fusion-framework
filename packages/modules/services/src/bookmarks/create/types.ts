import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from '../types';
import type { CreateBookmarksApiModels } from './api-models';


/**
 * The API version to use for creating bookmarks.
 * This type represents the allowed API versions for creating bookmarks.
 */
export type CreateBookmarkApiVersion = FilterAllowedApiVersions<keyof CreateBookmarksApiModels>;

/**
 * Represents the response payload for creating a new bookmark.
 * @template TVersion - The API version to use for the response.
 */
export type CreateBookmarkResponse<TVersion extends CreateBookmarkApiVersion> =
    CreateBookmarksApiModels[ExtractApiVersion<TVersion>]['response'];

/**
 * represents the request payload for creating a new bookmark.
 * @template TVersion - The API version to use for the request.
 */
export type CreateBookmarkRequest<TVersion extends CreateBookmarkApiVersion> =
    CreateBookmarksApiModels[ExtractApiVersion<TVersion>]['request'];

/**
 * represents the result of creating a new bookmark.
 * @template TVersion - The API version to use for the request.
 * @template TMethod - The method name on the `ClientMethod` type.
 * @template TResult - The result type.
 */
export type CreateBookmarkResult<
    TVersion extends CreateBookmarkApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = CreateBookmarkResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
