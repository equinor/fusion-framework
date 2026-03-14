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

/**
 * Typed API client for the Fusion notification service.
 *
 * Provides methods for notification CRUD operations, marking notifications
 * as seen, and managing user notification settings.
 *
 * @template TMethod - The client execution method (`'json'` or `'json$'`).
 * @template TClient - The underlying HTTP client type.
 */
export class NotificationApiClient<
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
> {
  /** Returns the {@link ApiVersion} enum for version-constant access. */
  get Version(): typeof ApiVersion {
    return ApiVersion;
  }

  /**
   * @param _client - The HTTP client used to execute requests.
   * @param _method - The execution method (`'json'` or `'json$'`).
   */
  constructor(
    protected _client: TClient,
    protected _method: TMethod,
  ) {}

  /**
   * Fetch all notifications for the current user.
   *
   * @template TVersion - The API version key.
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns All notifications matching the query.
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
   * Fetch a single notification by its identifier.
   *
   * @template TVersion - The API version key.
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns The notification with the specified ID.
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
   * Mark a notification as seen by the current user.
   *
   * @template TVersion - The API version key.
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns The updated notification.
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
   * Create a new notification.
   *
   * @template TVersion - The API version key.
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns The created notification.
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
   * Delete a notification by its identifier.
   *
   * @template TVersion - The API version key.
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns The deletion result.
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
   * Retrieve the current user's notification settings.
   *
   * @template TVersion - The API version key.
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns The user's notification settings.
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
   * Update the current user's notification settings.
   *
   * @template TVersion - The API version key.
   * @template TResult - The expected response type.
   * @param version - API version to use.
   * @returns The updated notification settings.
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
