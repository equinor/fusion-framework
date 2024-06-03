import type { ApiBookmark, ApiBookmark_SourceSystem } from '../api-models';

import { ApiVersion } from '../static';

/**
 * Represents the request payload for creating a new bookmark.
 */
type ApiCreateBookmarksRequest_v1 = {
    /** Display name of the bookmark */
    name: string;
    /** Description of the bookmark */
    description?: string;
    /** Is the bookmark shared with others */
    isShared?: boolean;
    /** Name of the app it belongs too, should correspond to a fusion app-key */
    appKey?: string;
    /** Id of the context it belongs too */
    contextId?: string;
    /** Any JSON object to store as the bookmark payload */
    payload: string;
    /** The source system which the bookmark belongs to */
    sourceSystem?: Partial<ApiBookmark_SourceSystem<ApiVersion.v1>>;
};

/**
 * Represents the response from the API when creating bookmarks.
 */
type ApiCreateBookmarksResponse_v1 = ApiBookmark<ApiVersion.v1> & {
    payload?: string;
};

/**
 * Represents the different API versions for creating bookmarks.
 * The `CreateBookmarksApiModels` type maps each API version to the corresponding request and response types.
 */
export type CreateBookmarksApiModels = {
    [ApiVersion.v1]: {
        request: ApiCreateBookmarksRequest_v1;
        response: ApiCreateBookmarksResponse_v1;
    };
};
