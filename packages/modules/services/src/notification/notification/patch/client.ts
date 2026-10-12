import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod } from '../../../types.js';
import type { ApiVersion } from '../../static.js';

import { generateParameters } from './generate-parameters.js';

import type {
  PatchNotificationArgs,
  PatchNotificationResponse,
  PatchNotificationResult,
} from './types.js';

/**
 * Method for updating a notification item
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const updateSeenByUser =
  <
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient,
  >(
    client: TClient,
    version: TVersion,
    method: TMethod = 'json' as TMethod,
  ) =>
  <T = PatchNotificationResponse<TVersion>>(
    args: PatchNotificationArgs<TVersion>,
    init?: ClientRequestInit<TClient, T>,
  ): PatchNotificationResult<TVersion, TMethod, T> =>
    client[method](
      ...generateParameters<T, TVersion, TClient>(version, args, init),
    ) as PatchNotificationResult<TVersion, TMethod, T>;

export default updateSeenByUser;
