import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { generateParameters } from './generate-parameters';

import type { ClientMethod } from '../../types';
import type { ApiResponse, ApiResult, ApiRequestArgs, SupportedApiVersion } from './types';

/**
 * Creates a curried function that fetches detailed person information.
 *
 * @template TVersion - Supported API version (e.g. `'v4'`).
 * @template TMethod - Client execution method (`'json'` or `'json$'`).
 * @template TClient - The underlying HTTP client type.
 * @template TArgs - Request argument type.
 * @param client - HTTP client used to execute the request.
 * @param version - API version to call.
 * @param method - Client method to use (defaults to `'json'`).
 * @returns A function that accepts person detail args and returns the result.
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
  <T = ApiResponse<TVersion, TArgs>>(
    args: TArgs,
    init?: ClientRequestInit<TClient, T>,
  ): ApiResult<TVersion, TArgs, TMethod, T> =>
    client[method](...generateParameters<T, TVersion, TClient>(version, args, init)) as ApiResult<
      TVersion,
      TArgs,
      TMethod,
      T
    >;

export default client;
