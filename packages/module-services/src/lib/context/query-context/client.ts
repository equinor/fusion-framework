import { IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion } from '../static';

import { generateParameters } from './generate-parameters';

import type { ClientMethod, RequestInitCallback } from '../../types';
import type { QueryContextArgs, QueryContextResponse } from './types';

/**
 *
 */
export const QueryContext =
    <
        TVersion extends ApiVersion,
        TMethod extends keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
        TResult = QueryContextResponse<TVersion>
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod
    ) =>
    <T = TResult>(
        args: QueryContextArgs<TVersion>,
        cb?: RequestInitCallback<T, TClient>
    ): ClientMethod<T>[TMethod] =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, cb)
        ) as ClientMethod<T>[TMethod];

export default QueryContext;
