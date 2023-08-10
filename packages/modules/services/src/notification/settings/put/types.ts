import { IHttpClient, ClientRequestInit } from '@equinor/fusion-framework-module-http/client';
import { ClientMethod } from '../../../types';
import { ApiNotificationSettingsEntity } from '../../api-models';
import { ApiVersion } from '../../static';

type PutUserNotificationSettingsArgsTypes = {
    [ApiVersion.v1]: ApiNotificationSettingsEntity<ApiVersion.v1>;
    [ApiVersion.v2]: ApiNotificationSettingsEntity<ApiVersion.v2>;
};

export type PutUserNotificationSettingsArgs<T extends string> = T extends keyof typeof ApiVersion
    ? PutUserNotificationSettingsArgsTypes[(typeof ApiVersion)[T]]
    : unknown;

type GetUserNotificationSettingsResponseTypes = {
    [ApiVersion.v2]: ApiNotificationSettingsEntity<ApiVersion.v2>;
    [ApiVersion.v1]: ApiNotificationSettingsEntity<ApiVersion.v1>;
};

export type PutUserNotificationSettingsResponse<T> = T extends keyof typeof ApiVersion
    ? GetUserNotificationSettingsResponseTypes[(typeof ApiVersion)[T]]
    : unknown;

export type PutUserNotificationSettingsFn<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TClient extends IHttpClient = IHttpClient,
    TResult = PutUserNotificationSettingsResponse<TVersion>,
> = (
    args: PutUserNotificationSettingsArgs<TVersion>,
    init?: ClientRequestInit<TClient, TResult>,
) => PutUserNotificationSettingsResult<TVersion, TMethod, TResult>;

export type PutUserNotificationSettingsResult<
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
    TResult = PutUserNotificationSettingsResponse<TVersion>,
> = ClientMethod<TResult>[TMethod];
