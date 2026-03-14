import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import { generateParameters } from './generate-parameters';

import type { ClientDataMethod } from '../../types';
import type { ApiResponse, ApiRequestArgs, SupportedApiVersion } from './types';

/**
 * Creates a curried function that fetches a person's profile photo.
 *
 * @template TVersion - Supported API version (e.g. `'v2'`).
 * @template TMethod - Client execution method (`'blob'` or `'blob$'`).
 * @template TClient - The underlying HTTP client type.
 * @template TArgs - Request argument type.
 * @param client - HTTP client used to execute the request.
 * @param version - API version to call.
 * @param method - Client method to use (defaults to `'blob'`).
 * @returns A function that accepts photo args and returns blob data.
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
