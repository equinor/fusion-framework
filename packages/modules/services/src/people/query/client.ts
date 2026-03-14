import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { generateParameters } from './generate-parameters';

import type { ClientMethod } from '../../types';
import type { ApiResponse, ApiResult, ApiRequestArgs, SupportedApiVersion } from './types';

/**
 * Creates a curried function that queries the people service.
 *
 * @template TVersion - Supported API version (e.g. `'v2'`).
 * @template TMethod - Client execution method.
 * @template TClient - The underlying HTTP client type.
 * @template TArgs - Request argument type.
 * @param client - HTTP client used to execute the request.
 * @param version - API version to call.
 * @param method - Client method to use (defaults to `'json'`).
 * @returns A function that accepts query args and returns person results.
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
    client[method](...generateParameters<T, TVersion, TClient>(version, args, init)) as ApiResult<
      TVersion,
      TMethod,
      T
    >;

export default client;
