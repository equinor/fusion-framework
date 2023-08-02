import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiNotificationSettingsEntity } from '../../api-models';
import { ApiVersion } from '../../static';

type GetUserNotificationSettingsArgs_v1 = {
    userId: string;
};

type GetUserNotificationSettingsArgs_v2 = GetUserNotificationSettingsArgs_v1;

type GetUserNotificationSettingsArgsTypes = {
    [ApiVersion.v1]: GetUserNotificationSettingsArgs_v1;
    [ApiVersion.v2]: GetUserNotificationSettingsArgs_v2;
};

export type GetUserNotificationSettingsArgs<T extends string> = T extends keyof typeof ApiVersion
    ? GetUserNotificationSettingsArgsTypes[(typeof ApiVersion)[T]]
    : unknown;

type GetUserNotificationSettingsResponseTypes = {
    [ApiVersion.v1]: ApiNotificationSettingsEntity<ApiVersion.v1>;
    [ApiVersion.v2]: ApiNotificationSettingsEntity<ApiVersion.v2>;
};

export type GetUserNotificationSettingsResponse<T> = T extends keyof typeof ApiVersion
    ? GetUserNotificationSettingsResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type GetUserNotificationSettingsFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = GetUserNotificationSettingsResponse<TVersion>,
> = (
    args: GetUserNotificationSettingsArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => GetUserNotificationsSettingsResult<TVersion, TMethod, TResult>;

export type GetUserNotificationsSettingsResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = GetUserNotificationSettingsResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
