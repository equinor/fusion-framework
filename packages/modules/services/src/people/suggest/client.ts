import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { generateParameters } from './generate-parameters';

import type { ClientMethod } from '../../types';
import type { ApiResponse, ApiResult } from './types';

/**
 * Method for fetching context item from context service
 * @param client - client for execution of request
 * @param method - client method to call
 */
export const client =
  <
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient,
  >(
    client: TClient,
    method: TMethod = 'json' as TMethod,
  ) =>
    <T = ApiResponse>(
      init?: ClientRequestInit<TClient, T>,
    ): ApiResult<TMethod, T> =>
      client[method](...generateParameters<T, TClient>(init)) as ApiResult<
        TMethod,
        T
      >;

export default client;
