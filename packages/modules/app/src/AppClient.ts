import { catchError, map, Observable, ObservableInput } from 'rxjs';

import { Query } from '@equinor/fusion-query';
import { queryValue } from '@equinor/fusion-query/operators';

import { HttpResponseError, IHttpClient } from '@equinor/fusion-framework-module-http';
import { jsonSelector } from '@equinor/fusion-framework-module-http/selectors';

import { ApiApplicationSchema } from './application.schema';

import { AppConfig, AppManifest } from './types';
import { AppConfigError, AppManifestError } from './errors';

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
    getAppConfig: <TType = unknown>(args: {
        appKey: string;
        tag?: string;
    }) => ObservableInput<AppConfig<TType>>;
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

    constructor(client: IHttpClient) {
        const expire = 1 * 60 * 1000;
        this.#manifest = new Query<AppManifest, { appKey: string }>({
            client: {
                fn: ({ appKey }) => {
                    return client.json(`/apps/${appKey}`, {
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
                            const response = (await jsonSelector(res)) as { value: unknown[] };
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
                        headers: {
                            'Api-Version': '1.0',
                        },
                    });
                },
            },
            key: (args) => JSON.stringify(args),
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

    getAppConfig<TType = unknown>(args: {
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

    [Symbol.dispose]() {
        console.warn('AppClient disposed');
        this.#manifest.complete();
        this.#manifests.complete();
        this.#config.complete();
    }
}

export default AppClient;
