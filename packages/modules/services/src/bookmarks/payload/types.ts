import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from '../types';
import type { ApiBookmarkPayload } from '../api-models';

import { ApiVersion } from '../static';

/**
 * Defines the API payload model for the `GetBookmark` operation.
 */
export type GetBookmarkPayloadApiModels = {
    [ApiVersion.v1]: {
        request: { bookmarkId: string };
        response: ApiBookmarkPayload<ApiVersion.v1>;
    };
};

/**
 * Represents the allowed API versions for the GetBookmarkPayload API.
 * This type is used to filter the API versions that are allowed for the GetBookmarkPayload API.
 */
export type GetBookmarkPayloadApiVersion = FilterAllowedApiVersions<
    keyof GetBookmarkPayloadApiModels
>;

/**
 * The response type for the `GetBookmarkPayload` API endpoint, parameterized by the API version.
 *
 * @template TVersion - The API version, which determines the shape of the response.
 */
export type GetBookmarkPayloadResponse<TVersion extends GetBookmarkPayloadApiVersion> =
    GetBookmarkPayloadApiModels[ExtractApiVersion<TVersion>]['response'];

/** Returns args for GetBookmark based on version*/
/**
 * Represents the arguments for the `GetBookmarkPayload` API endpoint.
 *
 * @template TVersion - The API version to use for the `GetBookmarkPayload` endpoint.
 */
export type GetBookmarkPayloadRequest<TVersion extends GetBookmarkPayloadApiVersion> =
    GetBookmarkPayloadApiModels[ExtractApiVersion<TVersion>]['request'];

/**
 * Represents the result type of a GetBookmarkPayload API method.
 *
 * @template TVersion - The version of the GetBookmarkPayload API.
 * @template TMethod - The specific method of the ClientMethod interface to use.
 * @template TResult - The response type of the GetBookmarkPayload API method.
 */
export type GetBookmarkPayloadResult<
    TVersion extends GetBookmarkPayloadApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = GetBookmarkPayloadResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
