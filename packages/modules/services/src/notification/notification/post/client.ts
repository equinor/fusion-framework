import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiVersion } from '../../static';

import { generateParameters } from './generate-parameters';

import type {
    PostNotificationArgs,
    PostNotificationResult,
    PostNotificationResponse,
} from './types';

/**
 * Method for creating a notification item
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const createNotification =
    <
        TVersion extends string = keyof typeof ApiVersion,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod
    ) =>
    <T = PostNotificationResponse<TVersion>>(
        args: PostNotificationArgs<TVersion>,
        init?: ClientRequestInit<TClient, T>
    ): PostNotificationResult<TVersion, TMethod, T> =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, init)
        ) as PostNotificationResult<TVersion, TMethod, T>;

export default createNotification;
