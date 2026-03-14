import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import type { ApiVersion } from '..';

import { generateParameters } from './generate-parameters';

import type { ClientMethod, GetContextArgs, GetContextResponse, GetContextResult } from './types';

/**
 * Creates a curried function that fetches a single context entity by ID.
 *
 * @template TVersion - The API version key (e.g. `'v1'`).
 * @template TMethod - The client execution method (`'json'` or `'json$'`).
 * @template TClient - The underlying HTTP client type.
 * @param client - HTTP client used to execute the request.
 * @param version - API version to call.
 * @param method - Client method to use (defaults to `'json'`).
 * @returns A function that accepts context args and returns the result.
 */
export const getContext =
  <
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient,
  >(
    client: TClient,
    version: TVersion,
    method: TMethod = 'json' as TMethod,
  ) =>
  <T = GetContextResponse<TVersion>>(
    args: GetContextArgs<TVersion>,
    init?: ClientRequestInit<TClient, T>,
  ): GetContextResult<TVersion, TMethod, T> =>
    client[method](
      ...generateParameters<T, TVersion, TClient>(version, args, init),
    ) as GetContextResult<TVersion, TMethod, T>;

export default getContext;
