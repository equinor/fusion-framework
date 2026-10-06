import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod } from '../../../types.js';
import type { ApiVersion } from '../../static.js';

import { generateParameters } from './generate-parameters.js';

import type {
  GetNotificationArgs,
  GetNotificationResult,
  GetNotificationResponse,
} from './types.js';

/**
 * Method for fetching a notification item from notifications service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const getNotificationById =
  <
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient,
  >(
    client: TClient,
    version: TVersion,
    method: TMethod = 'json' as TMethod,
  ) =>
  <T = GetNotificationResponse<TVersion>>(
    args: GetNotificationArgs<TVersion>,
    init?: ClientRequestInit<TClient, T>,
  ): GetNotificationResult<TVersion, TMethod, T> =>
    client[method](
      ...generateParameters<T, TVersion, TClient>(version, args, init),
    ) as GetNotificationResult<TVersion, TMethod, T>;

export default getNotificationById;
