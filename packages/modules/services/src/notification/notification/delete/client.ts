import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiVersion } from '../../static';

import { generateParameters } from './generate-parameters';

import type {
    DeleteNotificationArgs,
    DeleteNotificationResponse,
    DeleteNotificationResult,
} from './types';

/**
 * Method for deleting notification item from notifications service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const deleteNotification =
    <
        TVersion extends string = keyof typeof ApiVersion,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod,
    ) =>
    <T = DeleteNotificationResponse<TVersion>>(
        args: DeleteNotificationArgs<TVersion>,
        init?: ClientRequestInit<TClient, T>,
    ): DeleteNotificationResult<TVersion, TMethod, T> =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, init),
        ) as DeleteNotificationResult<TVersion, TMethod, T>;

export default deleteNotification;
