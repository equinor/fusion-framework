import { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiVersion } from '../../static';

import { generateParameters } from './generate-parameters';

import type {
    GetUserNotificationSettingsArgs,
    GetUserNotificationsSettingsResult,
    GetUserNotificationSettingsResponse,
} from './types';

/**
 * Method for fetching user notification settings from the notifications service
 * @param client - client for execution of request
 * @param version - version of API to call
 * @param method - client method to call
 */
export const getUserNotificationSettings =
    <
        TVersion extends string = keyof typeof ApiVersion,
        TMethod extends keyof ClientMethod = keyof ClientMethod,
        TClient extends IHttpClient = IHttpClient,
    >(
        client: TClient,
        version: TVersion,
        method: TMethod = 'json' as TMethod,
    ) =>
    <T = GetUserNotificationSettingsResponse<TVersion>>(
        args: GetUserNotificationSettingsArgs<TVersion>,
        init?: ClientRequestInit<TClient, T>,
    ): GetUserNotificationsSettingsResult<TVersion, TMethod, T> =>
        client[method](
            ...generateParameters<T, TVersion, TClient>(version, args, init),
        ) as GetUserNotificationsSettingsResult<TVersion, TMethod, T>;

export default getUserNotificationSettings;
