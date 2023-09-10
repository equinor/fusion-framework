import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { generateParameters } from './generate-parameters';

import type { ClientMethod } from '../../types';
import type { ApiResponse, ApiResult, ApiRequestArgs, SupportedApiVersion } from './types';

/**
 * Method for fetching context item from context service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const client =
    <
        TVersion extends SupportedApiVersion,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
        TArgs extends ApiRequestArgs<TVersion> = ApiRequestArgs<TVersion>,
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod,
    ) =>
    <T = ApiResponse<TVersion>>(
        args: TArgs,
        init?: ClientRequestInit<TClient, T>,
    ): ApiResult<TVersion, TMethod, T> =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, init),
        ) as ApiResult<TVersion, TMethod, T>;

export default client;
