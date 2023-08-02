import { IHttpClient } from '@equinor/fusion-framework-module-http';

import { ClientMethod, ApiVersion } from '@equinor/fusion-framework-module-services/context';

import { getContext, GetContextFn, GetContextResponse, GetContextResult } from './get';

import { queryContext, QueryContextFn, QueryContextResponse, QueryContextResult } from './query';

import {
    RelatedContextFn,
    RelatedContextResponse,
    RelatedContextResult,
    relatedContexts,
} from './related';

export class ContextApiClient<
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
> {
    get Version(): typeof ApiVersion {
        return ApiVersion;
    }

    constructor(
        protected _client: TClient,
        protected _method: TMethod,
    ) {}

    /**
     * Fetch context by id
     * @see {@link get/client}
     */
    public get<
        TVersion extends string = keyof typeof ApiVersion,
        TResult = GetContextResponse<TVersion>,
    >(
        version: TVersion,
        ...args: Parameters<GetContextFn<TVersion, TMethod, TClient, TResult>>
    ): GetContextResult<TVersion, TMethod, TResult> {
        const fn = getContext<TVersion, TMethod, TClient>(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    /**
     * Query context service
     * @see {@link query/client}
     */
    public query<
        TVersion extends string = keyof typeof ApiVersion,
        TResult = QueryContextResponse<TVersion>,
    >(
        version: TVersion,
        ...args: Parameters<QueryContextFn<TVersion, TMethod, TClient, TResult>>
    ): QueryContextResult<TVersion, TMethod, TResult> {
        const fn = queryContext<TVersion, TMethod, TClient>(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    /**
     * Query context service
     * @see {@link query/client}
     */
    public related<
        TVersion extends string = keyof typeof ApiVersion,
        TResult = RelatedContextResponse<TVersion>,
    >(
        version: TVersion,
        ...args: Parameters<RelatedContextFn<TVersion, TMethod, TClient, TResult>>
    ): RelatedContextResult<TVersion, TMethod, TResult> {
        const fn = relatedContexts<TVersion, TMethod, TClient>(this._client, version, this._method);
        return fn<TResult>(...args);
    }
}

export default ContextApiClient;
