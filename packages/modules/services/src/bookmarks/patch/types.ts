import type { PatchBookmarksApiModels } from './api-models';
import type { ClientMethod, FilterAllowedApiVersions, ExtractApiVersion } from '../types';

/**
 * Represents the available versions of the Patch Bookmarks API.
 * This type is a key of the `PatchBookmarksApiModels` object, which defines the
 * models for each API version.
 */
export type PatchBookmarksApiVersion = FilterAllowedApiVersions<keyof PatchBookmarksApiModels>;

/**
 * Represents the allowed API versions for patching bookmarks.
 */
export type PatchBookmarkVersion = FilterAllowedApiVersions<PatchBookmarksApiVersion>;

/**
 * Represents the response type for the `PatchBookmarks` API endpoint.
 * The specific response type depends on the `TVersion` type parameter, which
 * corresponds to the API version being used.
 */
export type PatchBookmarkResponse<TVersion extends PatchBookmarksApiVersion> =
    PatchBookmarksApiModels[ExtractApiVersion<TVersion>]['response'];

/**
 * Represents the arguments for patching a bookmark.
 * The type parameter `TVersion` specifies the version of the Patch Bookmarks API to use.
 * The actual arguments are defined in the `PatchBookmarksApiModels` type, which is indexed by the `TVersion` parameter.
 */
export type PatchBookmarkRequest<TVersion extends PatchBookmarksApiVersion> =
    PatchBookmarksApiModels[ExtractApiVersion<TVersion>]['request'];

/**
 * Represents the result of a patch operation on bookmarks, which can be performed using a specific API version and method.
 *
 * @template TVersion - The version of the bookmarks API being used.
 * @template TMethod - The specific method being used to perform the patch operation, which must be a key of the `ClientMethod` type.
 * @template TResult - The expected response type for the patch operation, which is typically `PatchBookmarkResponse<TVersion>`.
 */
export type PatchBookmarksResult<
    TVersion extends PatchBookmarksApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = PatchBookmarkResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
