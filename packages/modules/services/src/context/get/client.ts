import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { ApiVersion } from '@equinor/fusion-framework-module-services/context';

import { generateParameters } from './generate-parameters';

import type { ClientMethod, GetContextArgs, GetContextResponse, GetContextResult } from './types';

/**
 * Method for fetching context item from context service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const getContext =
    <
        TVersion extends string = keyof typeof ApiVersion,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod
    ) =>
    <T = GetContextResponse<TVersion>>(
        args: GetContextArgs<TVersion>,
        init?: ClientRequestInit<TClient, T>
    ): GetContextResult<TVersion, TMethod, T> =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, init)
        ) as GetContextResult<TVersion, TMethod, T>;

export default getContext;
