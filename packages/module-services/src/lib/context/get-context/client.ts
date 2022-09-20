import { IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion } from '../static';

import { generateParameters } from './generate-parameters';

import type { ClientMethod, RequestInitCallback } from '../../types';
import type { GetContextArgs, GetContextResponse } from './types';

export const getContext =
    <
        TVersion extends ApiVersion,
        TMethod extends keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
        TResult = GetContextResponse<TVersion>
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod
    ) =>
    <T = TResult>(
        args: GetContextArgs<TVersion>,
        cb?: RequestInitCallback<T, TClient>
    ): ClientMethod<T>[TMethod] =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, cb)
        ) as ClientMethod<T>[TMethod];

export default getContext;
