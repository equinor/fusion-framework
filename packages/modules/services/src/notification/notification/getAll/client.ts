import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod } from '../../../types';
import type { ApiVersion } from '../../static';

import { generateParameters } from './generate-parameters';

import type {
  GetNotificationsArgs,
  GetNotificationsResult,
  GetNotificationsResponse,
} from './types';

/**
 * Method for fetching all notifications item from notification service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const getNotifications =
  <
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient,
  >(
    client: TClient,
    version: TVersion,
    method: TMethod = 'json' as TMethod,
  ) =>
  <T = GetNotificationsResponse<TVersion>>(
    args: GetNotificationsArgs<TVersion>,
    init?: ClientRequestInit<TClient, T>,
  ): GetNotificationsResult<TVersion, TMethod, T> =>
    client[method](
      ...generateParameters<T, TVersion, TClient>(version, args, init),
    ) as GetNotificationsResult<TVersion, TMethod, T>;

export default getNotifications;
