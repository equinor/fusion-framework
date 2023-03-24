import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiVersion } from '../../static';

import { generateParameters } from './generate-parameters';

import type {
    PatchNotificationArgs,
    PatchNotificationResponse,
    PatchNotificationResult,
} from './types';

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
        TClient extends IHttpClient = IHttpClient
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod
    ) =>
    <T = PatchNotificationResponse<TVersion>>(
        args: PatchNotificationArgs<TVersion>,
        init?: ClientRequestInit<TClient, T>
    ): PatchNotificationResult<TVersion, TMethod, T> =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, init)
        ) as PatchNotificationResult<TVersion, TMethod, T>;

export default updateSeenByUser;
