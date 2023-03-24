import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiVersion } from '../../static';

import { generateParameters } from './generate-parameters';

import type {
    PutUserNotificationSettingsArgs,
    PutUserNotificationSettingsResult,
    PutUserNotificationSettingsResponse,
} from './types';

/**
 * Method for fetching user notification settings from the notifications service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const updateUserNotificationSettings =
    <
        TVersion extends string = keyof typeof ApiVersion,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod
    ) =>
    <T = PutUserNotificationSettingsResponse<TVersion>>(
        args: PutUserNotificationSettingsArgs<TVersion>,
        init?: ClientRequestInit<TClient, T>
    ): PutUserNotificationSettingsResult<TVersion, TMethod, T> =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, init)
        ) as PutUserNotificationSettingsResult<TVersion, TMethod, T>;

export default updateUserNotificationSettings;
