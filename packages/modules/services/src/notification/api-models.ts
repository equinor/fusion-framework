import { ApiVersion } from './static';

type ApiNotificationEntity_v1 = {
    id: string;
    appKey: string;
    emailPriority: number;
    fallbackHtml: string;
    targetAzureUniqueId: string;
    title: string;
    card: string;
    created: string;
    createdBy: CreatedBy_v1;
    createdByApplication: CreatedByApplication_v1;
    seenByUser: boolean;
    seen: string;
    sourceSystem: SourceSystem_v1;
};

type SourceSystem_v1 = {
    name: string;
    subSystem: string;
    identifier: string;
};

type CreatedByApplication_v1 = {
    id: string;
    title: string;
};

type CreatedBy_v1 = {
    id: string;
    name: string;
    jobTitle: string;
    mail: string;
    accountType: string;
};

type ApiNotificationEntity_v2 = unknown;

type ApiNotificationEntityTypes = {
    [ApiVersion.v1]: ApiNotificationEntity_v1;
    [ApiVersion.v2]: ApiNotificationEntity_v2;
};

export type ApiNotificationEntity<T extends string = ApiVersion> = T extends ApiVersion
    ? ApiNotificationEntityTypes[T]
    : unknown;

/**User notification Settings */
type ApiNotificationSettingsEntity_v1 = {
    email: boolean;
    delayInMinutes: number;
    appConfig: AppConfig_v1[];
};

type AppConfig_v1 = {
    appKey: string;
    enabled: boolean;
};

type ApiNotificationSettingsEntity_v2 = unknown;

type ApiNotificationSettingEntityTypes = {
    [ApiVersion.v1]: ApiNotificationSettingsEntity_v1;
    [ApiVersion.v2]: ApiNotificationSettingsEntity_v2;
};

export type ApiNotificationSettingsEntity<T extends string = ApiVersion> = T extends ApiVersion
    ? ApiNotificationSettingEntityTypes[T]
    : unknown;
