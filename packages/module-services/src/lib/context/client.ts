import { IHttpClient } from '@equinor/fusion-framework-module-http';

import { ApiVersion } from './static';
import { getContext, GetContextResponse } from './get-context';
import { ClientMethod } from '../types';
import queryContext from './query-context';

export class ContextApiClient<TClient extends IHttpClient, TMethod extends keyof ClientMethod> {
    constructor(protected _client: TClient, protected _method: TMethod) {}

    public get<TVersion extends ApiVersion, TResult = GetContextResponse<TVersion>>(
        version: TVersion,
        ...args: Parameters<ReturnType<typeof getContext<TVersion, TMethod, TClient, TResult>>>
    ): ReturnType<ReturnType<typeof getContext<TVersion, TMethod, TClient, TResult>>> {
        return getContext<TVersion, TMethod, TClient, TResult>(
            this._client,
            version,
            this._method
        )(...args);
    }

    /**
     * @see {@link queryContext}
     */
    public query<TVersion extends ApiVersion, TResult = GetContextResponse<TVersion>>(
        version: TVersion,
        ...args: Parameters<ReturnType<typeof queryContext<TVersion, TMethod, TClient, TResult>>>
    ): ReturnType<ReturnType<typeof queryContext<TVersion, TMethod, TClient, TResult>>> {
        return queryContext<TVersion, TMethod, TClient, TResult>(
            this._client,
            version,
            this._method
        )(...args);
    }
}

// const tester = new ContextApiClient(null as unknown as IHttpClient, 'json');
// tester.get(ApiVersion.v1, { id: '12' });

// tester.query(ApiVersion.v1, { query: { filter: 'sdsadas' } });

export default ContextApiClient;
