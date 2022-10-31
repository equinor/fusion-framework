import {
    BehaviorSubject,
    distinctUntilChanged,
    Observable,
    pairwise,
    Subscription,
    takeWhile,
} from 'rxjs';

import { ModuleType } from '@equinor/fusion-framework-module';

import { Query, queryValue } from '@equinor/fusion-observable/query';

import {
    EventModule,
    FrameworkEvent,
    FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

import { IAppModuleConfig } from './configurator';
import { compareAppManifest } from './helpers';

import type { AppConfig, AppManifest } from './types';

export interface IAppProvider {
    getApp(appKey: string): Observable<AppManifest>;
    getAllApps(): Observable<AppManifest[]>;
    getAppConfig<TType = unknown>(appKey: string): Observable<AppConfig<TType>>;
    setCurrentApp(appKey: string): void;
    readonly current$: Observable<AppManifest | undefined>;
}

export class AppProvider extends Observable<AppManifest | undefined> implements IAppProvider {
    #appClient: Query<AppManifest, { appKey: string }>;
    #appsClient: Query<AppManifest[], void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #configClient: Query<AppConfig<any>, { appKey: string; tag?: string }>;

    #current$: BehaviorSubject<AppManifest | undefined>;

    #subscription = new Subscription();

    get current(): AppManifest | undefined {
        return this.#current$.value;
    }

    get current$(): Observable<AppManifest | undefined> {
        return this.#current$.pipe(distinctUntilChanged(compareAppManifest));
    }

    constructor(args: { config: IAppModuleConfig; event?: ModuleType<EventModule> }) {
        super((observer) => this.current$.subscribe(observer));

        const { event, config } = args;

        this.#current$ = new BehaviorSubject<AppManifest | undefined>(undefined);

        this.#appClient = new Query(config.getApp);
        this.#appsClient = new Query(config.getApps);
        this.#configClient = new Query(config.getConfig);

        this.#subscription.add(this.#appClient.complete);
        this.#subscription.add(this.#appsClient.complete);
        this.#subscription.add(this.#configClient.complete);
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
    }

    public getApp(appKey: string): Observable<AppManifest> {
        return queryValue(this.#appClient.query({ appKey }));
    }

    public getAllApps(): Observable<AppManifest[]> {
        return queryValue(this.#appsClient.query());
    }

    public getAppConfig<TType = unknown>(
        appKey: string,
        tag?: string
    ): Observable<AppConfig<TType>> {
        return queryValue(this.#configClient.query({ appKey, tag }));
    }

    public setCurrentApp(appKey: string): Promise<void> {
        return new Promise((complete, error) => {
            const query$ = this.#appClient.query({ appKey }, { skipQueue: true });
            this.#subscription.add(
                queryValue(query$).subscribe({
                    next: (x) => this.#current$.next(x),
                    error,
                    complete,
                })
            );
        });
    }

    public dispose() {
        this.#subscription.unsubscribe();
    }
}

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onCurrentAppChanged: FrameworkEvent<
            FrameworkEventInit<{ next?: AppManifest; previous?: AppManifest }, IAppProvider>
        >;
    }
}

export default AppProvider;
