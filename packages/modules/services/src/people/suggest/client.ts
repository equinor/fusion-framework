import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { generateParameters } from './generate-parameters';

import type { ClientMethod } from '../../types';
import type { ApiResponse, ApiResult } from './types';

/**
 * Client factory for calling the people suggest endpoint.
 * @param client - HTTP client used to perform the request
 * @param method - HTTP client method to call (for example, 'json')
 */
export const client =
  <
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient,
  >(
    client: TClient,
    method: TMethod = 'json' as TMethod,
  ) =>
  <T = ApiResponse>(init?: ClientRequestInit<TClient, T>): ApiResult<TMethod, T> =>
    client[method](...generateParameters<T, TClient>(init)) as ApiResult<TMethod, T>;

export default client;
