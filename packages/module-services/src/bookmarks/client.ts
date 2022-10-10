import { IHttpClient } from '@equinor/fusion-framework-module-http';

import { ClientMethod, ApiVersion } from '@equinor/fusion-framework-module-services/context';
import getBookmark from './get/client';
import { ApiVersions, GetBookmarkResult, GetBookmarksFn, GetBookmarksResult } from './get/types';

export class BookmarksApiClient<
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TPayload = unknown
> {
    get Version(): typeof ApiVersion {
        return ApiVersion;
    }

    constructor(protected _client: TClient, protected _method: TMethod) {}

    /**
     * Fetch context by id
     * @see {@link get/client}
     */
    public get<TVersion extends ApiVersions, TResult = GetBookmarkResult<TVersion, TPayload>>(
        version: TVersion,
        ...args: Parameters<GetBookmarksFn<TVersion, TMethod, TClient, TPayload, TResult>>
    ): GetBookmarksResult<TVersion, TMethod, TPayload, TResult> {
        const fn = getBookmark<TVersion, TMethod, TClient>(this._client, version, this._method);
        return fn<TResult>(...args);
    }
}

export default BookmarksApiClient;
