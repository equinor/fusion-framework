import { IHttpClient } from '@equinor/fusion-framework-module-http';

import { ClientMethod } from '../types';

import { getContext, GetContextFn, GetContextResponse, GetContextResult } from './get';
import { queryContext, QueryContextFn, QueryContextResponse, QueryContextResult } from './query';

import { ApiVersion } from './static';

export class ContextApiClient<
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient
> {
    get Version(): typeof ApiVersion {
        return ApiVersion;
    }
    constructor(protected _client: TClient, protected _method: TMethod) {}

    public get<
        TVersion extends string = keyof typeof ApiVersion,
        TResult = GetContextResponse<TVersion>
    >(
        version: TVersion,
        ...args: Parameters<GetContextFn<TVersion, TMethod, TClient, TResult>>
    ): GetContextResult<TVersion, TMethod, TResult> {
        const fn = getContext<TVersion, TMethod, TClient>(this._client, version, this._method);
        return fn<TResult>(...args);
    }

    /**
     * @see {@link query-context/client}
     */
    public query<
        TVersion extends string = keyof typeof ApiVersion,
        TResult = QueryContextResponse<TVersion>
    >(
        version: TVersion,
        ...args: Parameters<QueryContextFn<TVersion, TMethod, TClient, TResult>>
    ): QueryContextResult<TVersion, TMethod, TResult> {
        const fn = queryContext<TVersion, TMethod, TClient>(this._client, version, this._method);
        return fn<TResult>(...args);
    }
}

export default ContextApiClient;
