import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import type { ClientMethod } from '../types';
import type { GetNotificationFn, GetNotificationResult } from './notification/get';
import {
  createNotification,
  deleteNotification,
  getNotificationById,
  getNotifications,
  updateSeenByUser,
} from './notification';
import { ApiVersion } from './static';
import type { PatchNotificationFn, PatchNotificationResult } from './notification/patch';
import type { GetNotificationsFn, GetNotificationsResult } from './notification/getAll';
import type { PostNotificationResult, PostNotificationFn } from './notification/post';
import type { DeleteNotificationFn, DeleteNotificationResult } from './notification/delete';
import updateUserNotificationSettings, {
  type PutUserNotificationSettingsFn,
  type PutUserNotificationSettingsResult,
} from './settings/put';
import getUserNotificationSettings, {
  type GetUserNotificationSettingsFn,
  type GetUserNotificationsSettingsResult,
} from './settings/get';

export class NotificationApiClient<
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
> {
  get Version(): typeof ApiVersion {
    return ApiVersion;
  }

  constructor(
    protected _client: TClient,
    protected _method: TMethod,
  ) {}

  /**
   * Fetch all notifications
   * @see {@link getAll/client}
   */
  public getAll<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = GetNotificationsResult<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<GetNotificationsFn<TVersion, TMethod, TClient, TResult>>
  ): GetNotificationsResult<TVersion, TMethod, TResult> {
    const fn = getNotifications<TVersion, TMethod, TClient>(this._client, version, this._method);
    return fn<TResult>(...args);
  }

  /**
   * Fetch notification by id
   * @see {@link getById/client}
   */
  public getById<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = GetNotificationResult<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<GetNotificationFn<TVersion, TMethod, TClient, TResult>>
  ): GetNotificationResult<TVersion, TMethod, TResult> {
    const fn = getNotificationById<TVersion, TMethod, TClient>(this._client, version, this._method);
    return fn<TResult>(...args);
  }

  /**
   * Set notification seen by user
   * @see {@link setSeenByUser/client}
   */
  public setSeenByUser<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = PatchNotificationResult<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<PatchNotificationFn<TVersion, TMethod, TClient, TResult>>
  ): PatchNotificationResult<TVersion, TMethod, TResult> {
    const fn = updateSeenByUser<TVersion, TMethod, TClient>(this._client, version, this._method);
    return fn<TResult>(...args);
  }

  /**
   * Create a notification
   * @see {@link create/client}
   */
  public create<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = PostNotificationResult<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<PostNotificationFn<TVersion, TMethod, TClient, TResult>>
  ): PostNotificationResult<TVersion, TMethod, TResult> {
    const fn = createNotification<TVersion, TMethod, TClient>(this._client, version, this._method);
    return fn<TResult>(...args);
  }

  /**
   * Delete a notification
   * @see {@link delete/client}
   */
  public delete<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = PostNotificationResult<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<DeleteNotificationFn<TVersion, TMethod, TClient, TResult>>
  ): DeleteNotificationResult<TVersion, TMethod, TResult> {
    const fn = deleteNotification<TVersion, TMethod, TClient>(this._client, version, this._method);
    return fn<TResult>(...args);
  }
  /**
   * Get users notification settings
   * @see {@link getSettings/client}
   */
  public getSettings<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = PostNotificationResult<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<GetUserNotificationSettingsFn<TVersion, TMethod, TClient, TResult>>
  ): GetUserNotificationsSettingsResult<TVersion, TMethod, TResult> {
    const fn = getUserNotificationSettings<TVersion, TMethod, TClient>(
      this._client,
      version,
      this._method,
    );
    return fn<TResult>(...args);
  }
  /**
   * Update user notification settings
   * @see {@link updateSettings/client}
   */
  public updateSettings<
    TVersion extends string = keyof typeof ApiVersion,
    TResult = PostNotificationResult<TVersion>,
  >(
    version: TVersion,
    ...args: Parameters<PutUserNotificationSettingsFn<TVersion, TMethod, TClient, TResult>>
  ): PutUserNotificationSettingsResult<TVersion, TMethod, TResult> {
    const fn = updateUserNotificationSettings<TVersion, TMethod, TClient>(
      this._client,
      version,
      this._method,
    );
    return fn<TResult>(...args);
  }
}

export default NotificationApiClient;
