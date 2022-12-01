import {
    BehaviorSubject,
    catchError,
    distinctUntilChanged,
    filter,
    firstValueFrom,
    from,
    map,
    merge,
    Observable,
    pairwise,
    scan,
    Subscription,
    switchMap,
    takeWhile,
    throwIfEmpty,
} from 'rxjs';

import { ModuleType } from '@equinor/fusion-framework-module';

import { Query } from '@equinor/fusion-query';

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

    loadApp<TEnvironment = unknown, TModule = any>(
        appKey: string
    ): Observable<AppBundle<TEnvironment, TModule>>;
}

/**
 * @template TModule - ES module type
 */
export type AppBundle<TEnvironment = unknown, TModule = unknown> = {
    manifest: AppManifest;
    config: AppConfig<TEnvironment>;
    /** ES module instance */
    module: TModule;
};

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
        return Query.extractQueryValue(
            this.#appClient.query({ appKey }).pipe(
                catchError((cause) => {
                    throw Error('failed to load manifest', { cause });
                })
            )
        );
    }

    public getAllApps(): Observable<AppManifest[]> {
        return Query.extractQueryValue(this.#appsClient.query());
    }

    public getAppConfig<TType = unknown>(
        appKey: string,
        tag?: string
    ): Observable<AppConfig<TType>> {
        return Query.extractQueryValue(
            this.#configClient.query({ appKey, tag }).pipe(
                catchError((cause) => {
                    throw Error('failed to load config', { cause });
                })
            )
        );
    }

    public setCurrentApp(appKey: string): Promise<void> {
        return new Promise((complete, error) => {
            const query$ = this.#appClient.query({ appKey });
            this.#subscription.add(
                Query.extractQueryValue(query$).subscribe({
                    next: (x) => this.#current$.next(x),
                    error,
                    complete,
                })
            );
        });
    }

    public loadApp<TEnvironment = unknown, TModule = unknown>(
        appKey: string
    ): Observable<AppBundle<TEnvironment, TModule>> {
        const loadApp$ = this.getApp(appKey).pipe(
            switchMap((manifest) => {
                return firstValueFrom(
                    // TODO: use source from manifest when service is ready!
                    /* @vite-ignore */
                    from(import(manifest.entry)).pipe(map((module) => ({ manifest, module })))
                );
            })
        );

        const loadConfig$ = this.getAppConfig(appKey).pipe(map((config) => ({ config })));

        return merge(loadApp$, loadConfig$).pipe(
            scan((acc: Partial<AppBundle>, next) => Object.assign({}, acc, next), {}),
            /** only output when all attributes are filled */
            filter((x): x is AppBundle<TEnvironment, TModule> =>
                ['manifest', 'module', 'config'].every((key) => !!x[key as keyof AppBundle])
            ),
            throwIfEmpty(() => 'failed to load application')
        );
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
