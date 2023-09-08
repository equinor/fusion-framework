import { IHttpClient } from '@equinor/fusion-framework-module-http';

import type { ClientDataMethod, ClientMethod } from '../types';
import { ApiVersion } from './static';

import {
    client as getClient,
    ApiResponse as GetPersonApiResponse,
    ApiRequestFn as GetPersonApiRequestFn,
    ApiResult as GetPersonResult,
    SupportedApiVersion as SupportedGetPersonApiVersion,
} from './person-details';

import {
    client as queryClient,
    ApiResponse as QueryPersonApiResponse,
    ApiRequestFn as QueryPersonApiRequestFn,
    ApiResult as QueryPersonResult,
    SupportedApiVersion as SupportedQueryApiVersion,
} from './query';

import {
    client as photoClient,
    ApiResponse as PhotoPersonApiResponse,
    ApiRequestFn as PhotoPersonApiRequestFn,
    ApiResult as PhotoPersonResult,
    SupportedApiVersion as SupportedPhotoApiVersion,
} from './person-photo';

export class PeopleApiClient<
    // TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
> {
    get Version(): typeof ApiVersion {
        return ApiVersion;
    }

    constructor(protected _client: TClient) {}

    /**
     * Fetch person by id
     */
    public get<
        TVersion extends SupportedGetPersonApiVersion,
        TResult = GetPersonApiResponse<TVersion>,
        TMethod extends keyof ClientMethod<TResult> = keyof ClientMethod<TResult>,
    >(
        version: TVersion,
        method: TMethod,
        ...args: Parameters<GetPersonApiRequestFn<TVersion, TMethod, TClient, TResult>>
    ): GetPersonResult<TVersion, TMethod, TResult> {
        const fn = getClient<TVersion, TMethod, TClient>(this._client, version, method);
        return fn<TResult>(...args);
    }

    /**
     * Query person service
     */
    public query<
        TVersion extends SupportedQueryApiVersion,
        TResult = QueryPersonApiResponse<TVersion>,
        TMethod extends keyof ClientMethod<TResult> = keyof ClientMethod<TResult>,
    >(
        version: TVersion,
        method: TMethod,
        ...args: Parameters<QueryPersonApiRequestFn<TVersion, TMethod, TClient, TResult>>
    ): QueryPersonResult<TVersion, TMethod, TResult> {
        const fn = queryClient<TVersion, TMethod, TClient>(this._client, version, method);
        return fn<TResult>(...args);
    }

    /**
     * Photo person service
     */
    public photo<
        TVersion extends SupportedPhotoApiVersion,
        TResult extends Blob = PhotoPersonApiResponse<TVersion>,
        TMethod extends keyof ClientDataMethod = keyof ClientDataMethod,
    >(
        version: TVersion,
        method: TMethod,
        ...args: Parameters<PhotoPersonApiRequestFn<TVersion, TMethod, TClient, TResult>>
    ): PhotoPersonResult<TMethod> {
        const fn = photoClient<TVersion, TMethod, TClient>(this._client, version, method);
        return fn<TResult>(...args);
    }
}

export default PeopleApiClient;
