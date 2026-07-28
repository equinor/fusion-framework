import { catchError, map, type Observable, type ObservableInput, tap } from 'rxjs';

import { Query } from '@equinor/fusion-query';
import { queryValue } from '@equinor/fusion-query/operators';

import {
  HttpJsonResponseError,
  HttpResponseError,
  type IHttpClient,
} from '@equinor/fusion-framework-module-http';
import { jsonSelector } from '@equinor/fusion-framework-module-http/selectors';

import { ApiApplicationBuildSchema, ApiApplicationSchema } from './schemas';

import type {
  AppBuildManifest,
  AppConfig,
  AppManifest,
  AppSettings,
  ConfigEnvironment,
} from './types';
import { AppBuildError, AppConfigError, AppManifestError, AppSettingsError } from './errors';
import { AppConfigSelector } from './AppConfigSelector';

/**
 * Contract for an app service client that fetches application manifests,
 * build metadata, configurations, and per-user settings from the Fusion apps API.
 *
 * All methods return `ObservableInput` so consumers can use either `Observable`
 * or `Promise`-based consumption patterns.
 */
export interface IAppClient extends Disposable {
  /**
   * Fetches the manifest for a single application.
   *
   * @param args - Object containing the `appKey` and an optional version `tag`.
   * @returns An observable that emits the resolved {@link AppManifest}.
   * @throws {AppManifestError} When the manifest cannot be loaded (404, 401, 410, or unknown).
   */
  getAppManifest: (args: { appKey: string; tag?: string }) => ObservableInput<AppManifest>;

  /**
   * Fetches the build metadata (entry point, version, asset path) for an application.
   *
   * @param args - Object containing the `appKey` and an optional version `tag`.
   * @returns An observable that emits the resolved {@link AppBuildManifest}.
   * @throws {AppBuildError} When the build metadata cannot be loaded.
   */
  getAppBuild: (args: { appKey: string; tag?: string }) => ObservableInput<AppBuildManifest>;

  /**
   * Fetches manifests for all registered applications.
   *
   * @param args - Optional filter; set `filterByCurrentUser` to `true` to return
   *   only apps the authenticated user has access to.
   * @returns An observable that emits an array of {@link AppManifest} objects.
   */
  getAppManifests: (args?: { filterByCurrentUser?: boolean }) => ObservableInput<AppManifest[]>;

  /**
   * Fetches the runtime configuration (environment variables and endpoints) for an application.
   *
   * @template TType - Shape of the `environment` record in the returned config.
   * @param args - Object containing the `appKey` and an optional version `tag`.
   * @returns An observable that emits the resolved {@link AppConfig}.
   * @throws {AppConfigError} When the configuration cannot be loaded.
   */
  getAppConfig: <TType extends ConfigEnvironment = ConfigEnvironment>(args: {
    appKey: string;
    tag?: string;
  }) => ObservableInput<AppConfig<TType>>;

  /**
   * Fetches per-user settings for an application.
   *
   * @param args - Object containing the `appKey`.
   * @returns An observable that emits the {@link AppSettings} record.
   * @throws {AppSettingsError} When settings cannot be loaded.
   */
  getAppSettings: (args: { appKey: string }) => ObservableInput<AppSettings>;

  /**
   * Persists updated per-user settings for an application via PUT.
   *
   * @param args - Object containing the `appKey` and the `settings` payload to save.
   * @returns An observable that emits the persisted {@link AppSettings}.
   * @throws {AppSettingsError} When the update request fails.
   */
  updateAppSettings: (args: {
    appKey: string;
    settings: AppSettings;
  }) => ObservableInput<AppSettings>;
}

/**
 * Transforms a raw API application response into an {@link AppManifest},
 * adding backwards-compatible `key` and `name` getters.
 *
 * @returns An object conforming to the AppManifest interface.
 */
const ApplicationSchema = ApiApplicationSchema.transform((x): AppManifest => {
  const { category, ...props } = x;
  return {
    ...props,
    // TODO(#5124): remove deprecated appKey
    get key() {
      return props.appKey;
    },
    // TODO(#5124): remove deprecated name
    get name() {
      return props.displayName;
    },
    categoryId: category?.id,
    category,
  } as AppManifest;
});

/**
 * Default implementation of {@link IAppClient} that communicates with the
 * Fusion app service API over HTTP.
 *
 * Uses {@link Query} internally for request deduplication and caching
 * (1-minute expiry by default). Responses are validated against Zod schemas
 * ({@link ApiApplicationSchema}, {@link ApiApplicationBuildSchema}) and
 * HTTP errors are mapped to typed error classes.
 *
 * @example
 * ```ts
 * const httpClient = await http.createClient('apps');
 * const appClient = new AppClient(httpClient);
 * appClient.getAppManifest({ appKey: 'my-app' }).subscribe(console.log);
 * ```
 */
export class AppClient implements IAppClient {
  #manifest: Query<AppManifest, { appKey: string }>;
  #manifests: Query<AppManifest[], { filterByCurrentUser?: boolean } | undefined>;
  #config: Query<AppConfig, { appKey: string; tag?: string }>;
  #build: Query<AppBuildManifest, { appKey: string; tag?: string }>;
  #settings: Query<AppSettings, { appKey: string; settings?: AppSettings }>;
  #client: IHttpClient;

  /**
   * Creates a new {@link AppClient} backed by the given HTTP client.
   * @param client - The HTTP client used to communicate with the Fusion app service API.
   */
  constructor(client: IHttpClient) {
    this.#client = client;

    const expire = 1 * 60 * 1000;

    this.#build = new Query<AppBuildManifest, { appKey: string; tag?: string }>({
      client: {
        fn: ({ appKey, tag }) => {
          return client.json(`/apps/${appKey}/builds/${tag}`, {
            headers: {
              'Api-Version': '1.0',
            },
            selector: async (res: Response) =>
              ApiApplicationBuildSchema.parse(await jsonSelector(res)) as AppBuildManifest,
          });
        },
      },
      queueOperator: 'merge',
      key: ({ appKey, tag }) => `${appKey}@${tag}`,
      expire,
    });

    this.#manifest = new Query<AppManifest, { appKey: string; tag?: string }>({
      client: {
        fn: ({ appKey, tag }) => {
          return client.json$(tag ? `/apps/${appKey}@${tag}` : `/persons/me/apps/${appKey}`, {
            headers: {
              'Api-Version': '1.0',
            },
            selector: async (res: Response) => ApplicationSchema.parse(await jsonSelector(res)),
          });
        },
      },
      queueOperator: 'merge',
      key: ({ appKey }) => appKey,
      expire,
    });

    this.#manifests = new Query<AppManifest[], { filterByCurrentUser?: boolean } | undefined>({
      client: {
        fn: (filter) => {
          const path = filter?.filterByCurrentUser
            ? '/persons/me/apps'
            : '/apps?=$expand=category,admins,owners,keywords';
          return client.json(path, {
            headers: {
              'Api-Version': '1.0',
            },
            selector: async (res: Response) => {
              const response = (await jsonSelector(res)) as { value: AppManifest[] };
              return ApplicationSchema.array().parse(response.value);
            },
          });
        },
      },
      key: (filter) => (filter?.filterByCurrentUser ? 'currentUser' : 'all'),
      expire,
    });

    this.#config = new Query<AppConfig, { appKey: string; tag?: string }>({
      client: {
        fn: ({ appKey, tag = 'latest' }) => {
          return client.json(`/apps/${appKey}/builds/${tag}/config`, {
            selector: AppConfigSelector,
            headers: {
              'Api-Version': '1.0',
            },
          });
        },
      },
      queueOperator: 'merge',
      key: (args) => JSON.stringify(args),
      expire,
    });

    this.#settings = new Query<AppSettings, { appKey: string }>({
      client: {
        fn: ({ appKey }) => {
          return client.json<AppSettings>(`/persons/me/apps/${appKey}/settings`, {
            headers: {
              'Api-Version': '1.0',
            },
          });
        },
      },
      key: (args) => args.appKey,
      expire,
    });
  }

  /**
   * Fetches the build metadata for an application.
   * @param args - Object containing the `appKey` and an optional version `tag`.
   * @returns An observable that emits the resolved {@link AppBuildManifest}.
   * @throws {AppBuildError} When the build metadata cannot be loaded.
   */
  getAppBuild(args: { appKey: string; tag?: string }): Observable<AppBuildManifest> {
    // unwrap the build manifest and map errors to a typed AppBuildError
    return this.#build.query(args).pipe(
      // unwrap the query result into the build manifest
      map((res) => res.value as AppBuildManifest),
      // map http/unknown errors into a typed AppBuildError
      catchError((err) => {
        const cause = err?.cause || err;

        // rethrow already-typed errors as-is
        if (cause instanceof AppBuildError) {
          throw cause;
        }
        // map http errors to a typed AppBuildError
        if (cause instanceof HttpJsonResponseError || cause instanceof HttpResponseError) {
          throw AppBuildError.fromHttpResponse(cause.response, { cause });
        }
        throw new AppBuildError('unknown', 'failed to load build', { cause });
      }),
    );
  }

  /**
   * Fetches the manifest for a single application.
   * @param args - Object containing the `appKey` and an optional version `tag`.
   * @returns An observable that emits the resolved {@link AppManifest}.
   * @throws {AppManifestError} When the manifest cannot be loaded.
   */
  getAppManifest(args: { appKey: string; tag?: string }): Observable<AppManifest> {
    // unwrap the manifest and map errors to a typed AppManifestError
    return this.#manifest.query(args).pipe(
      queryValue,
      // map http/unknown errors into a typed AppManifestError
      catchError((err) => {
        const cause = err?.cause || err;

        // rethrow already-typed errors as-is
        if (cause instanceof AppManifestError) {
          throw cause;
        }

        // map http errors to a typed AppManifestError
        if (cause instanceof HttpJsonResponseError || cause instanceof HttpResponseError) {
          throw AppManifestError.fromHttpResponse(cause.response, { cause });
        }

        throw new AppManifestError('unknown', 'failed to load manifest', { cause });
      }),
    );
  }

  /**
   * Fetches manifests for all registered applications.
   * @param args - Optional filter; set `filterByCurrentUser` to `true` to return only apps the authenticated user has access to.
   * @returns An observable that emits an array of {@link AppManifest} objects.
   */
  getAppManifests(args: { filterByCurrentUser?: boolean } | undefined): Observable<AppManifest[]> {
    // unwrap the query result into the manifest array
    return this.#manifests.query(args).pipe(queryValue);
  }

  /**
   * Fetches the runtime configuration for an application.
   * @template TType - Shape of the `environment` record in the returned config.
   * @param args - Object containing the `appKey` and an optional version `tag`.
   * @returns An observable that emits the resolved {@link AppConfig}.
   * @throws {AppConfigError} When the configuration cannot be loaded.
   */
  getAppConfig<TType extends ConfigEnvironment = ConfigEnvironment>(args: {
    appKey: string;
    tag?: string;
  }): Observable<AppConfig<TType>> {
    // unwrap the config and map errors to a typed AppConfigError
    return this.#config.query(args).pipe(
      // unwrap the query result into the config
      map((res) => res.value as AppConfig<TType>),
      // map http/unknown errors into a typed AppConfigError
      catchError((err) => {
        /** handle both direct errors and errors wrapped in a `cause` property */
        const cause = err?.cause || err;

        // rethrow already-typed errors as-is
        if (cause instanceof AppConfigError) {
          throw cause;
        }
        // map http errors to a typed AppConfigError
        if (cause instanceof HttpJsonResponseError || cause instanceof HttpResponseError) {
          throw AppConfigError.fromHttpResponse(cause.response, { cause });
        }
        throw new AppConfigError('unknown', 'failed to load config', { cause });
      }),
    );
  }

  /**
   * Fetches per-user settings for an application.
   * @param args - Object containing the `appKey`.
   * @returns An observable that emits the {@link AppSettings} record.
   * @throws {AppSettingsError} When settings cannot be loaded.
   */
  getAppSettings(args: { appKey: string }): Observable<AppSettings> {
    // unwrap the settings and map errors to a typed AppSettingsError
    return this.#settings.query(args).pipe(
      queryValue,
      // map http/unknown errors into a typed AppSettingsError
      catchError((err) => {
        /** handle both direct errors and errors wrapped in a `cause` property */
        const cause = err?.cause || err;

        // rethrow already-typed errors as-is
        if (cause instanceof AppSettingsError) {
          throw cause;
        }
        // map http errors to a typed AppSettingsError
        if (cause instanceof HttpJsonResponseError || cause instanceof HttpResponseError) {
          throw AppSettingsError.fromHttpResponse(cause.response, { cause });
        }
        throw new AppSettingsError('unknown', 'failed to load settings', { cause });
      }),
    );
  }

  /**
   * Persists updated per-user settings for an application via PUT.
   * @param args - Object containing the `appKey` and the `settings` payload to save.
   * @returns An observable that emits the persisted {@link AppSettings}.
   */
  updateAppSettings(args: { appKey: string; settings: AppSettings }): Observable<AppSettings> {
    const { appKey, settings } = args;
    return (
      this.#client
        .json$<AppSettings>(`/persons/me/apps/${appKey}/settings`, {
          method: 'PUT',
          body: settings,
          headers: {
            'Api-Version': '1.0',
          },
        })
        // update the settings cache with the persisted value
        .pipe(
          tap((value) => {
            // update cache with new settings
            this.#settings.mutate(
              { appKey },
              {
                value,
                updated: Date.now(),
              },
            );
          }),
        )
    );
  }

  /**
   * Disposes of the client, completing all internal query streams.
   */
  [Symbol.dispose]() {
    console.warn('AppClient disposed');
    this.#manifest.complete();
    this.#manifests.complete();
    this.#config.complete();
    this.#settings.complete();
    this.#build.complete();
  }
}

export default AppClient;
