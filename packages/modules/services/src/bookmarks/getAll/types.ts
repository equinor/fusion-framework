import type { ClientMethod, ExtractApiVersion, FilterAllowedApiVersions } from '../types';

import { ApiVersion } from '../static';
import { ApiBookmark } from '../api-models';

type GetAllBookmarksRequestFilter_v1 =
    | string
    | {
          appKey?: string;
          contextId?: string;
          sourceSystem?: {
              identifier?: string;
              name?: string;
              subSystem?: string;
          };
      };

/**
 * Defines the API models for fetching all user bookmarks
 */
export type GetAllBookmarksApiModels = {
    [ApiVersion.v1]: {
        request: {
            filter?: GetAllBookmarksRequestFilter_v1;
        };
        response: Array<ApiBookmark<ApiVersion.v1>>;
    };
};

/**
 * Represents the allowed API versions for the "GetAllBookmark" API.
 */
export type GetAllBookmarksApiVersion = FilterAllowedApiVersions<keyof GetAllBookmarksApiModels>;

/**
 * Represents the response type for the `GetAllBookmark` API endpoint.
 *
 * @template TVersion - The API version of the `GetAllBookmark` endpoint.
 */
export type GetAllBookmarksResponse<TVersion extends GetAllBookmarksApiVersion> =
    GetAllBookmarksApiModels[ExtractApiVersion<TVersion>]['response'];

/**
 * Represents the request type for the `GetAllBookmark` API endpoint, parameterized by the API version.
 *
 * @template TVersion - The API version to use for the request type.
 */
export type GetAllBookmarksRequest<TVersion extends GetAllBookmarksApiVersion> =
    GetAllBookmarksApiModels[ExtractApiVersion<TVersion>]['request'];

/**
 * Represents the result of the `GetAllBookmarks` API call, which is the response from the HTTP client method specified by `TMethod`.
 *
 * @template TVersion - The version of the API to use.
 * @template TMethod - The HTTP method to use for the request, which must be a key of `ClientMethod`.
 * @template TPayload - The type of the request payload.
 * @template TResult - The type of the response data, which is `GetAllBookmarkResponse<TVersion, TPayload>`.
 */
export type GetAllBookmarksResult<
    TVersion extends GetAllBookmarksApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = GetAllBookmarksResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
