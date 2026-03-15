import { ApiVersion } from './static';

/** Notification entity returned by the v1 notification API. */
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

/** Source system metadata for a notification. */
type SourceSystem_v1 = {
  name: string;
  subSystem: string;
  identifier: string;
};

/** Application that created the notification. */
type CreatedByApplication_v1 = {
  id: string;
  title: string;
};

/** Person who created the notification. */
type CreatedBy_v1 = {
  id: string;
  name: string;
  jobTitle: string;
  mail: string;
  accountType: string;
};

/** Placeholder for the v2 notification entity (not yet defined). */
type ApiNotificationEntity_v2 = unknown;

type ApiNotificationEntityTypes = {
  [ApiVersion.v1]: ApiNotificationEntity_v1;
  [ApiVersion.v2]: ApiNotificationEntity_v2;
};

/**
 * Version-aware notification entity type.
 *
 * Resolves to the concrete entity shape for a given {@link ApiVersion}.
 *
 * @template T - An `ApiVersion` member string.
 */
export type ApiNotificationEntity<T extends string = ApiVersion> = T extends ApiVersion
  ? ApiNotificationEntityTypes[T]
  : unknown;

/** User notification settings entity for API v1. */
type ApiNotificationSettingsEntity_v1 = {
  email: boolean;
  delayInMinutes: number;
  appConfig: AppConfig_v1[];
};

/** Per-application notification toggle within user settings. */
type AppConfig_v1 = {
  appKey: string;
  enabled: boolean;
};

/** Placeholder for the v2 notification settings entity (not yet defined). */
type ApiNotificationSettingsEntity_v2 = unknown;

type ApiNotificationSettingEntityTypes = {
  [ApiVersion.v1]: ApiNotificationSettingsEntity_v1;
  [ApiVersion.v2]: ApiNotificationSettingsEntity_v2;
};

/**
 * Version-aware notification settings entity type.
 *
 * @template T - An `ApiVersion` member string.
 */
export type ApiNotificationSettingsEntity<T extends string = ApiVersion> = T extends ApiVersion
  ? ApiNotificationSettingEntityTypes[T]
  : unknown;
