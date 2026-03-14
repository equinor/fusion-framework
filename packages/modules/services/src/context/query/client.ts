import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import type { ApiVersion } from '..';

import { generateParameters } from './generate-parameters';

import type {
  QueryContextArgs,
  QueryContextResponse,
  QueryContextResult,
  ClientMethod,
} from './types';

/**
 * Creates a curried function that queries the context service.
 *
 * @template TVersion - The API version key.
 * @template TMethod - The client execution method.
 * @template TClient - The underlying HTTP client type.
 * @param client - HTTP client used to execute the request.
 * @param version - API version to call.
 * @param method - Client method to use (defaults to `'json'`).
 * @returns A function that accepts query args and returns context results.
 */
export const queryContext =
  <
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient,
  >(
    client: TClient,
    version: TVersion,
    method: TMethod = 'json' as TMethod,
  ) =>
  <T = QueryContextResponse<TVersion>>(
    args: QueryContextArgs<TVersion>,
    init?: ClientRequestInit<TClient, T>,
  ): QueryContextResult<TVersion, TMethod, T> =>
    client[method](
      ...generateParameters<T, TVersion, TClient>(version, args, init),
    ) as QueryContextResult<TVersion, TMethod, T>;

export default queryContext;
