import { catchError, map, Observable, ObservableInput, tap } from 'rxjs';

import { Query } from '@equinor/fusion-query';
import { queryValue } from '@equinor/fusion-query/operators';

import { HttpResponseError, IHttpClient } from '@equinor/fusion-framework-module-http';
import { jsonSelector } from '@equinor/fusion-framework-module-http/selectors';

import { ApiApplicationSchema } from './schemas';

import type { AppConfig, AppManifest, AppSettings, ConfigEnvironment } from './types';
import { AppConfigError, AppManifestError, AppSettingsError } from './errors';
import { AppConfigSelector } from './AppClient.Selectors';

export interface IAppClient extends Disposable {
    /**
     * Fetch app manifest by appKey
     */
    getAppManifest: (args: { appKey: string }) => ObservableInput<AppManifest>;

    /**
     * Fetch all app manifests
     */
    getAppManifests: (args?: { filterByCurrentUser?: boolean }) => ObservableInput<AppManifest[]>;

    /**
     * Fetch app config by appKey and tag
     */
    getAppConfig: <TType extends ConfigEnvironment = ConfigEnvironment>(args: {
        appKey: string;
        tag?: string;
    }) => ObservableInput<AppConfig<TType>>;

    /**
     * Fetch app settings by appKey
     */
    getAppSettings: (args: { appKey: string }) => ObservableInput<AppSettings>;

    /**
     * Set app settings by appKey
     * @param args - Object with appKey and settings
     * @returns ObservableInput<AppSettings>
     */
    updateAppSettings: (args: {
        appKey: string;
        settings: AppSettings;
    }) => ObservableInput<AppSettings>;
}

/**
 * Transforms an ApiApplicationSchema object into an AppManifest object.
 *
 * @returns An object conforming to the AppManifest interface.
 */
const ApplicationSchema = ApiApplicationSchema.transform((x): AppManifest => {
    const { category, ...props } = x;
    return {
        ...props,
        // TODO: remove deprecated appKey
        get key() {
            return props.appKey;
        },
        // TODO: remove deprecated name
        get name() {
            return props.displayName;
        },
        categoryId: category?.id,
        category,
    } as AppManifest;
});

/**
 * The `AppClient` class implements the `IAppClient` interface and provides methods to query
 * application manifests and configurations from a backend service.
 */
export class AppClient implements IAppClient {
    #manifest: Query<AppManifest, { appKey: string }>;
    #manifests: Query<AppManifest[], { filterByCurrentUser?: boolean } | undefined>;
    #config: Query<AppConfig, { appKey: string; tag?: string }>;
    #settings: Query<AppSettings, { appKey: string; settings?: AppSettings }>;
    #client: IHttpClient;

    constructor(client: IHttpClient) {
        this.#client = client;

        const expire = 1 * 60 * 1000;
        this.#manifest = new Query<AppManifest, { appKey: string }>({
            client: {
                fn: ({ appKey }) => {
                    return client.json(`/persons/me/apps/${appKey}`, {
                        headers: {
                            'Api-Version': '1.0',
                        },
                        selector: async (res: Response) =>
                            ApplicationSchema.parse(await jsonSelector(res)),
                    });
                },
            },
            key: ({ appKey }) => appKey,
            expire,
        });

        this.#manifests = new Query<AppManifest[], { filterByCurrentUser?: boolean } | undefined>({
            client: {
                fn: (filter) => {
                    const path = filter?.filterByCurrentUser ? '/persons/me/apps' : '/apps';
                    return client.json(path, {
                        headers: {
                            'Api-Version': '1.0',
                        },
                        selector: async (res: Response) => {
                            const body = await res.json();
                            return body;
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

    getAppManifest(args: { appKey: string }): Observable<AppManifest> {
        return this.#manifest.query(args).pipe(
            queryValue,
            catchError((err) => {
                /** extract cause, since error will be a `QueryError` */
                const { cause } = err;
                if (cause instanceof AppManifestError) {
                    throw cause;
                }
                if (cause instanceof HttpResponseError) {
                    throw AppManifestError.fromHttpResponse(cause.response, { cause });
                }
                throw new AppManifestError('unknown', 'failed to load manifest', { cause });
            }),
        );
    }

    getAppManifests(
        args: { filterByCurrentUser?: boolean } | undefined,
    ): Observable<AppManifest[]> {
        return this.#manifests.query(args).pipe(queryValue);
    }

    getAppConfig<TType extends ConfigEnvironment = ConfigEnvironment>(args: {
        appKey: string;
        tag?: string;
    }): Observable<AppConfig<TType>> {
        return this.#config.query(args).pipe(
            map((res) => res.value as AppConfig<TType>),
            catchError((err) => {
                /** extract cause, since error will be a `QueryError` */
                const { cause } = err;
                if (cause instanceof AppConfigError) {
                    throw cause;
                }
                if (cause instanceof HttpResponseError) {
                    throw AppConfigError.fromHttpResponse(cause.response, { cause });
                }
                throw new AppConfigError('unknown', 'failed to load config', { cause });
            }),
        );
    }

    getAppSettings(args: { appKey: string }): Observable<AppSettings> {
        return this.#settings.query(args).pipe(
            queryValue,
            catchError((err) => {
                /** extract cause, since error will be a `QueryError` */
                const { cause } = err;
                if (cause instanceof AppSettingsError) {
                    throw cause;
                }
                if (cause instanceof HttpResponseError) {
                    throw AppSettingsError.fromHttpResponse(cause.response, { cause });
                }
                throw new AppSettingsError('unknown', 'failed to load settings', { cause });
            }),
        );
    }

    updateAppSettings(args: { appKey: string; settings: AppSettings }): Observable<AppSettings> {
        const { appKey, settings } = args;
        return (
            this.#client
                // execute PUT request to update settings
                .json$<AppSettings>(`/persons/me/apps/${appKey}/settings`, {
                    method: 'PUT',
                    body: settings,
                    headers: {
                        'Api-Version': '1.0',
                    },
                })
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

    [Symbol.dispose]() {
        console.warn('AppClient disposed');
        this.#manifest.complete();
        this.#manifests.complete();
        this.#config.complete();
        this.#settings.complete();
    }
}

export default AppClient;
