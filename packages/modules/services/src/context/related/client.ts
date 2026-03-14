import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';

import type { ApiVersion } from '..';

import { generateParameters } from './generate-parameters';

import type {
  RelatedContextArgs,
  RelatedContextResponse,
  RelatedContextResult,
  ClientMethod,
} from './types';

/**
 * Creates a curried function that fetches contexts related to a given context.
 *
 * @template TVersion - The API version key.
 * @template TMethod - The client execution method.
 * @template TClient - The underlying HTTP client type.
 * @param client - HTTP client used to execute the request.
 * @param version - API version to call.
 * @param method - Client method to use (defaults to `'json'`).
 * @returns A function that accepts relation args and returns related contexts.
 */
export const relatedContexts =
  <
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient,
  >(
    client: TClient,
    version: TVersion,
    method: TMethod = 'json' as TMethod,
  ) =>
  <T = RelatedContextResponse<TVersion>>(
    args: RelatedContextArgs<TVersion>,
    init?: ClientRequestInit<TClient, T>,
  ): RelatedContextResult<TVersion, TMethod, T> =>
    client[method](
      ...generateParameters<T, TVersion, TClient>(version, args, init),
    ) as RelatedContextResult<TVersion, TMethod, T>;

export default relatedContexts;
