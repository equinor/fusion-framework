import { ApiVersion } from '../static';
import type { ApiBookmark, ApiBookmark_SourceSystem } from '../api-models';

/**
 * Represents the arguments for patching a bookmark for api version 1.
 */
type PatchBookmark_request_v1 = {
    /** The unique identifier of the bookmark. */
    id: string;
    /** The optional description of the bookmark. */
    description?: string;
    /** The optional flag indicating whether the bookmark is shared. */
    isShared?: boolean;
    /** The optional payload associated with the bookmark. */
    payload?: string;
    /** The optional information about the source system of the bookmark. */
    sourceSystem?: ApiBookmark_SourceSystem<ApiVersion.v1>;
};

/**
 * Represents the response from a patch bookmark operation.
 */
type PatchBookmark_response_v1 = ApiBookmark<ApiVersion.v1> & {
    /** data associated with the bookmark in string format */
    payload: string;
};

export type PatchBookmarksApiModels = {
    [ApiVersion.v1]: { request: PatchBookmark_request_v1; response: PatchBookmark_response_v1 };
};
