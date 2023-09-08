import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { generateParameters } from './generate-parameters';

import type { ClientDataMethod } from '../../types';
import type { ApiResponse, ApiRequestArgs, SupportedApiVersion } from './types';

/**
 * Method for fetching context item from context service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const client =
    <
        TVersion extends SupportedApiVersion,
        TMethod extends keyof ClientDataMethod = keyof ClientDataMethod,
        TClient extends IHttpClient = IHttpClient,
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'blob' as TMethod,
    ) =>
    <T extends Blob = ApiResponse<TVersion>>(
        args: ApiRequestArgs<TVersion>,
        init?: ClientRequestInit<TClient, T>,
    ): ClientDataMethod[TMethod] =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, init),
        ) as ClientDataMethod[TMethod];

export default client;
