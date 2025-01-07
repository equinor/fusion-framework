import {
    BehaviorSubject,
    distinctUntilChanged,
    from,
    map,
    Observable,
    pairwise,
    Subscription,
    takeWhile,
} from 'rxjs';

import { ModuleType } from '@equinor/fusion-framework-module';
import { EventModule } from '@equinor/fusion-framework-module-event';

import type { AppConfig, AppManifest, AppSettings, ConfigEnvironment, CurrentApp } from './types';

import { App, filterEmpty, IApp } from './app/App';
import { AppModuleConfig } from './AppConfigurator';
import { AppBundleStateInitial } from './app/types';
import { IAppClient } from './AppClient';
import { SemanticVersion } from '@equinor/fusion-framework-module';
import { version } from './version';

export class AppModuleProvider {
    static compareAppManifest<T extends AppManifest>(a?: T, b?: T): boolean {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    #appClient: IAppClient;

    #appBaseUri: string;

    #current$: BehaviorSubject<CurrentApp | null>;

    #subscription = new Subscription();

    #event?: ModuleType<EventModule>;

    /**
     * Get module version
     */
    get version(): SemanticVersion {
        return new SemanticVersion(version);
    }

    /**
     * fetch an application by key
     * @param appKey - application key
     * @remarks
     * - null when current app is cleared
     * - undefined if application never set
     */
    get current(): CurrentApp | null | undefined {
        return this.#current$.value;
    }

    get current$(): Observable<CurrentApp | null> {
        return this.#current$.pipe(
            distinctUntilChanged((prev, next) => {
                if (prev && next) {
                    return prev.appKey === next.appKey;
                }
                return prev === next;
            }),
        );
    }

    constructor(args: { config: AppModuleConfig; event?: ModuleType<EventModule> }) {
        const { event, config } = args;

        this.#appClient = config.client;
        this.#event = event;

        this.#current$ = new BehaviorSubject<CurrentApp>(undefined);

        this.#appBaseUri = config.assetUri ?? '';

        this.#subscription.add(
            this.current$
                .pipe(
                    pairwise(),
                    takeWhile(() => !!event),
                )
                .subscribe(([previous, next]) => {
                    event?.dispatchEvent('onCurrentAppChanged', {
                        source: this,
                        detail: { previous, next },
                    });
                }),
        );

        this.#subscription.add(
            this.#current$
                .pipe(
                    pairwise(),
                    map(([previous]) => previous),
                    filterEmpty(),
                )
                .subscribe((app) => app.dispose()),
        );
    }

    /**
     * fetch an application by key
     * @param appKey - application key
     */
    public getAppManifest(appKey: string): Observable<AppManifest> {
        return from(this.#appClient.getAppManifest({ appKey }));
    }

    public getAppManifests(filter?: { filterByCurrentUser: boolean }): Observable<AppManifest[]> {
        return from(this.#appClient.getAppManifests(filter));
    }

    /**
     * fetch all applications
     * @deprecated use `getAppManifests` instead
     */
    public getAllAppManifests(): Observable<AppManifest[]> {
        return this.getAppManifests();
    }

    /**
     * fetch configuration for an application
     * @param appKey - application key
     */
    public getAppConfig<TType extends ConfigEnvironment = ConfigEnvironment>(
        appKey: string,
        tag?: string,
    ): Observable<AppConfig<TType>> {
        return from(this.#appClient.getAppConfig<TType>({ appKey, tag }));
    }

    /**
     * fetch user settings for an application
     * @param appKey - application key
     */
    public getAppSettings(appKey: string): Observable<AppSettings> {
        return from(this.#appClient.getAppSettings({ appKey }));
    }

    /**
     * Put user settings for an application
     * @param appKey - application key
     * @param settings - The settings to add save
     */
    public updateAppSettings(appKey: string, settings: AppSettings): Observable<AppSettings> {
        return from(this.#appClient.updateAppSettings({ appKey, settings }));
    }

    /**
     * set the current application, will internally resolve manifest
     * @param appKey - application key
     */
    public setCurrentApp(appKeyOrApp: string | IApp): void {
        const app =
            typeof appKeyOrApp === 'string' ? this.createApp({ appKey: appKeyOrApp }) : appKeyOrApp;
        this.#current$.next(app as CurrentApp);
    }

    public clearCurrentApp(): void {
        this.#current$.next(null);
    }

    public get assetUri(): string {
        return this.#appBaseUri;
    }

    /**
     * This should not be used, only for legacy creation backdoor
     * @deprecated
     */
    public createApp(value: AppBundleStateInitial): App {
        console.warn();
        return new App(value, { provider: this, event: this.#event });
    }

    public dispose() {
        this.#subscription.unsubscribe();
    }
}

export default AppModuleProvider;
