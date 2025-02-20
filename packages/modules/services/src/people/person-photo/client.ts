import {
  type ClientRequestInit,
  type IHttpClient,
} from '@equinor/fusion-framework-module-http/client';

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
    TArgs extends ApiRequestArgs<TVersion> = ApiRequestArgs<TVersion>,
  >(
    client: TClient,
    version: TVersion,
    method: TMethod = 'blob' as TMethod,
  ) =>
  <T extends ApiResponse<TVersion> = ApiResponse<TVersion>>(
    args: TArgs,
    init?: ClientRequestInit<TClient, T>,
  ): ClientDataMethod<T>[TMethod] => {
    return client[method](
      ...generateParameters<T, TVersion, TClient>(version, args, init),
    ) as ClientDataMethod<T>[TMethod];
  };

export default client;
