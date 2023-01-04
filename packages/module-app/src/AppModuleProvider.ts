import {
    BehaviorSubject,
    catchError,
    distinctUntilChanged,
    map,
    Observable,
    pairwise,
    Subscription,
    takeWhile,
} from 'rxjs';

import { ModuleType } from '@equinor/fusion-framework-module';
import { HttpResponseError } from '@equinor/fusion-framework-module-http';
import { EventModule } from '@equinor/fusion-framework-module-event';

import { Query } from '@equinor/fusion-query';

import type { AppConfig, AppManifest, CurrentApp } from './types';

import { App, filterEmpty } from './app/App';
import { AppModuleConfig } from './AppConfigurator';
import { AppConfigError, AppManifestError } from './errors';
import { AppBundleStateInitial } from './app/types';

export class AppModuleProvider {
    static compareAppManifest<T extends AppManifest>(a?: T, b?: T): boolean {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    public appClient: Query<AppManifest, { appKey: string }>;
    #appsClient: Query<AppManifest[], void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #configClient: Query<AppConfig<any>, { appKey: string; tag?: string }>;

    #current$: BehaviorSubject<CurrentApp>;

    #subscription = new Subscription();

    #event?: ModuleType<EventModule>;

    /**
     * fetch an application by key
     * @param appKey - application key
     */
    get current(): CurrentApp {
        return this.#current$.value;
    }

    get current$(): Observable<CurrentApp> {
        return this.#current$.pipe(
            distinctUntilChanged((prev, next) => {
                if (prev && next) {
                    return prev.appKey === next.appKey;
                }
                return prev === next;
            })
        );
    }

    constructor(args: { config: AppModuleConfig; event?: ModuleType<EventModule> }) {
        const { event, config } = args;

        this.#event = event;

        this.#current$ = new BehaviorSubject<CurrentApp>(undefined);

        this.appClient = new Query(config.client.getAppManifest);
        this.#appsClient = new Query(config.client.getAppManifests);
        this.#configClient = new Query(config.client.getAppConfig);

        this.#subscription.add(() => this.appClient.complete());
        this.#subscription.add(() => this.#appsClient.complete());
        this.#subscription.add(() => this.#configClient.complete());
        this.#subscription.add(
            this.current$
                .pipe(
                    pairwise(),
                    takeWhile(() => !!event)
                )
                .subscribe(([previous, next]) => {
                    event?.dispatchEvent('onCurrentAppChanged', {
                        source: this,
                        detail: { previous, next },
                    });
                })
        );

        this.#subscription.add(
            this.#current$
                .pipe(
                    pairwise(),
                    map(([previous]) => previous),
                    filterEmpty()
                )
                .subscribe((app) => app.dispose())
        );
    }

    /**
     * fetch an application by key
     * @param appKey - application key
     */
    public getAppManifest(appKey: string): Observable<AppManifest> {
        return Query.extractQueryValue(
            this.appClient.query({ appKey }).pipe(
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
                })
            )
        );
    }

    /**
     * fetch all applications
     */
    public getAllAppManifests(): Observable<AppManifest[]> {
        return Query.extractQueryValue(this.#appsClient.query());
    }

    /**
     * fetch configuration for an application
     * @param appKey - application key
     */
    public getAppConfig<TType = unknown>(
        appKey: string,
        tag?: string
    ): Observable<AppConfig<TType>> {
        return Query.extractQueryValue(
            this.#configClient.query({ appKey, tag }).pipe(
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
                })
            )
        );
    }

    /**
     * set the current application, will internally resolve manifest
     * @param appKey - application key
     */
    public setCurrentApp(appKeyOrApp: string | App): void {
        const app =
            typeof appKeyOrApp === 'string' ? this.createApp({ appKey: appKeyOrApp }) : appKeyOrApp;
        this.#current$.next(app as App);
    }

    public clearCurrentApp(): void {
        this.#current$.next(null);
    }

    /**
     * This should not be used, only for legacy creation backdoor
     */
    public createApp(value: AppBundleStateInitial): App {
        return new App(value, { provider: this, event: this.#event });
    }

    public dispose() {
        this.#subscription.unsubscribe();
    }
}

export default AppModuleProvider;
