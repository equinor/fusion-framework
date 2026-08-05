import type { ClientRequestInit, IHttpClient } from '@equinor/fusion-framework-module-http/client';
import type { ClientMethod } from '../types';

import {
  type ListMyAppsVersion,
  type ListMyAppsResponse,
  type ListMyAppsResult,
  listMyApps,
} from './endpoints/me-apps.get';
import {
  type GetMyAppStateVersion,
  type GetMyAppStateArg,
  type GetMyAppStateResponse,
  type GetMyAppStateResult,
  getMyAppState,
} from './endpoints/me-app.get';
import {
  type WipeMyAppStateVersion,
  type WipeMyAppStateArg,
  type WipeMyAppStateResponse,
  type WipeMyAppStateResult,
  wipeMyAppState,
} from './endpoints/me-app.delete';
import {
  type WipeAllMyStateVersion,
  type WipeAllMyStateResponse,
  type WipeAllMyStateResult,
  wipeAllMyState,
} from './endpoints/me.delete';
import {
  type ListAppUsersVersion,
  type ListAppUsersArg,
  type ListAppUsersResponse,
  type ListAppUsersResult,
  listAppUsers,
} from './endpoints/admin-app-users.get';
import {
  type GetUserAppStateVersion,
  type GetUserAppStateArg,
  type GetUserAppStateResponse,
  type GetUserAppStateResult,
  getUserAppState,
} from './endpoints/admin-app-user.get';
import {
  type WipeUserAppStateVersion,
  type WipeUserAppStateArg,
  type WipeUserAppStateResponse,
  type WipeUserAppStateResult,
  wipeUserAppState,
} from './endpoints/admin-app-user.delete';
import {
  type WipeAllAppUsersStateVersion,
  type WipeAllAppUsersStateArg,
  type WipeAllAppUsersStateResponse,
  type WipeAllAppUsersStateResult,
  wipeAllAppUsersState,
} from './endpoints/admin-app.delete';

/**
 * Provides a client interface for interacting with the App State API.
 *
 * Exposes the current user's own per-app state under `/persons/me/...`, and,
 * for callers holding the `Fusion.AppState.AppAdmin` (scoped to an app) or
 * `Fusion.AppState.Admin` role, per-user administrative state management
 * under `/admin/...`.
 *
 * The upstream OpenAPI spec does not publish response body schemas — only
 * status-code descriptions — so every method's response defaults to
 * `unknown`. Supply a `TResponse` type argument on the individual method call
 * to narrow the parsed response.
 *
 * @example
 * ```typescript
 * import { AppStateApiClient } from '@equinor/fusion-framework-module-services/app-state';
 * import { HttpClient } from '@equinor/fusion-framework-module-http';
 *
 * const httpClient = new HttpClient({ baseUri: 'https://my-app-state-api.com/' });
 * const client = new AppStateApiClient(httpClient, 'json');
 *
 * const apps = await client.listMyApps('v1');
 * await client.wipeMyAppState('v1', { appKey: 'my-app' });
 * ```
 *
 * @template TMethod - The client method to use for the request, defaults to 'json'.
 * @template TClient - The HTTP client to use for executing the request.
 */
export class AppStateApiClient<
  TMethod extends keyof ClientMethod<unknown> = keyof ClientMethod<unknown>,
  TClient extends IHttpClient = IHttpClient,
> {
  /**
   * Constructs a new instance of the AppStateApiClient class.
   *
   * @param _client - The client instance to use for making API requests.
   * @param _method - The client method to use for API requests.
   */
  constructor(
    protected _client: TClient,
    protected _method: TMethod,
  ) {}

  /**
   * Lists all apps that hold state for the current user, including a
   * document count and storage size per app.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `listMyApps` function.
   * @param version - The API version to use.
   * @param init - Optional request initialization options.
   * @returns The list of apps with stored state for the current user.
   */
  public listMyApps<TVersion extends ListMyAppsVersion, TResponse = ListMyAppsResponse<TVersion>>(
    version: TVersion,
    init?: ClientRequestInit<TClient, TResponse>,
  ): ListMyAppsResult<TVersion, TMethod, TResponse> {
    const fn = listMyApps(version, this._client, this._method);
    return fn(init);
  }

  /**
   * Gets the current user's state info for a single app.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `getMyAppState` function.
   * @param version - The API version to use.
   * @param args - The app-registration key identifying the app.
   * @param init - Optional request initialization options.
   * @returns The current user's state info for the given app.
   */
  public getMyAppState<
    TVersion extends GetMyAppStateVersion,
    TResponse = GetMyAppStateResponse<TVersion>,
  >(
    version: TVersion,
    args: GetMyAppStateArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): GetMyAppStateResult<TVersion, TMethod, TResponse> {
    const fn = getMyAppState(version, this._client, this._method);
    return fn(args, init);
  }

  /**
   * Wipes the current user's state for a single app (deletes and recreates
   * the user's state database for that app).
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `wipeMyAppState` function.
   * @param version - The API version to use.
   * @param args - The app-registration key identifying the app.
   * @param init - Optional request initialization options.
   * @returns The result of the wipe operation.
   */
  public wipeMyAppState<
    TVersion extends WipeMyAppStateVersion,
    TResponse = WipeMyAppStateResponse<TVersion>,
  >(
    version: TVersion,
    args: WipeMyAppStateArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): WipeMyAppStateResult<TVersion, TMethod, TResponse> {
    const fn = wipeMyAppState(version, this._client, this._method);
    return fn(args, init);
  }

  /**
   * Wipes all of the current user's state across every app (GDPR erasure).
   *
   * Always sends the `X-Confirm-Wipe: true` header the API requires for
   * this operation; pass `init.headers` to add further headers.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `wipeAllMyState` function.
   * @param version - The API version to use.
   * @param init - Optional request initialization options.
   * @returns The result of the wipe operation.
   */
  public wipeAllMyState<
    TVersion extends WipeAllMyStateVersion,
    TResponse = WipeAllMyStateResponse<TVersion>,
  >(
    version: TVersion,
    init?: ClientRequestInit<TClient, TResponse>,
  ): WipeAllMyStateResult<TVersion, TMethod, TResponse> {
    const fn = wipeAllMyState(version, this._client, this._method);
    return fn(init);
  }

  /**
   * Lists the users who hold state for a given app.
   *
   * Requires the `Fusion.AppState.AppAdmin` (scoped to the app) or
   * `Fusion.AppState.Admin` role.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `listAppUsers` function.
   * @param version - The API version to use.
   * @param args - The app-registration key identifying the app.
   * @param init - Optional request initialization options.
   * @returns The list of users with stored state for the given app.
   */
  public listAppUsers<
    TVersion extends ListAppUsersVersion,
    TResponse = ListAppUsersResponse<TVersion>,
  >(
    version: TVersion,
    args: ListAppUsersArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): ListAppUsersResult<TVersion, TMethod, TResponse> {
    const fn = listAppUsers(version, this._client, this._method);
    return fn(args, init);
  }

  /**
   * Gets a specific user's state info for a given app.
   *
   * Requires the `Fusion.AppState.AppAdmin` (scoped to the app) or
   * `Fusion.AppState.Admin` role.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `getUserAppState` function.
   * @param version - The API version to use.
   * @param args - The app-registration key and user object ID (OID).
   * @param init - Optional request initialization options.
   * @returns The user's state info for the given app.
   */
  public getUserAppState<
    TVersion extends GetUserAppStateVersion,
    TResponse = GetUserAppStateResponse<TVersion>,
  >(
    version: TVersion,
    args: GetUserAppStateArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): GetUserAppStateResult<TVersion, TMethod, TResponse> {
    const fn = getUserAppState(version, this._client, this._method);
    return fn(args, init);
  }

  /**
   * Wipes a specific user's state for a given app.
   *
   * Requires the `Fusion.AppState.AppAdmin` (scoped to the app) or
   * `Fusion.AppState.Admin` role.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `wipeUserAppState` function.
   * @param version - The API version to use.
   * @param args - The app-registration key and user object ID (OID).
   * @param init - Optional request initialization options.
   * @returns The result of the wipe operation.
   */
  public wipeUserAppState<
    TVersion extends WipeUserAppStateVersion,
    TResponse = WipeUserAppStateResponse<TVersion>,
  >(
    version: TVersion,
    args: WipeUserAppStateArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): WipeUserAppStateResult<TVersion, TMethod, TResponse> {
    const fn = wipeUserAppState(version, this._client, this._method);
    return fn(args, init);
  }

  /**
   * Wipes all users' state for a given app.
   *
   * Requires the `Fusion.AppState.AppAdmin` (scoped to the app) or
   * `Fusion.AppState.Admin` role, and always sends the `X-Confirm-Wipe: true`
   * header the API requires for this operation.
   *
   * @template TVersion - The version of the API to call.
   * @template TResponse - The type of the result of the `wipeAllAppUsersState` function.
   * @param version - The API version to use.
   * @param args - The app-registration key identifying the app.
   * @param init - Optional request initialization options.
   * @returns The result of the wipe operation.
   */
  public wipeAllAppUsersState<
    TVersion extends WipeAllAppUsersStateVersion,
    TResponse = WipeAllAppUsersStateResponse<TVersion>,
  >(
    version: TVersion,
    args: WipeAllAppUsersStateArg<TVersion>,
    init?: ClientRequestInit<TClient, TResponse>,
  ): WipeAllAppUsersStateResult<TVersion, TMethod, TResponse> {
    const fn = wipeAllAppUsersState(version, this._client, this._method);
    return fn(args, init);
  }
}

export default AppStateApiClient;
