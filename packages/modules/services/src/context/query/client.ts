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
 * Function for querying the context service
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
