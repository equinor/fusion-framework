import { AppConfig, AppManifest, AppModulesInstance, AppScriptModule } from '../types';
import { FlowSubject, Observable } from '@equinor/fusion-observable';

import type { AppModuleProvider } from '../AppModuleProvider';
import {
    combineLatest,
    filter,
    firstValueFrom,
    lastValueFrom,
    map,
    of,
    OperatorFunction,
    Subscription,
} from 'rxjs';
import { EventModule } from '@equinor/fusion-framework-module-event';
import { AnyModule, ModuleType } from '@equinor/fusion-framework-module';
import { createState } from './create-state';
import { actions, Actions } from './actions';
import { AppBundleState, AppBundleStateInitial } from './types';

import './events';

// TODO - move globally
export function filterEmpty<T>(): OperatorFunction<T | null | undefined, T> {
    return filter((value): value is T => value !== undefined && value !== null);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class App<TEnv = any, TModules extends Array<AnyModule> | unknown = unknown> {
    #state: FlowSubject<AppBundleState, Actions>;

    //#region === streams ===

    get manifest$(): Observable<AppManifest> {
        return this.#state.pipe(
            map(({ manifest }) => manifest),
            filterEmpty()
        );
    }

    get config$(): Observable<AppConfig<TEnv>> {
        return this.#state.pipe(
            map(({ config }) => config),
            filterEmpty()
        );
    }

    get modules$(): Observable<AppScriptModule> {
        return this.#state.pipe(
            map(({ modules }) => modules),
            filterEmpty()
        );
    }

    get instance$(): Observable<AppModulesInstance<TModules>> {
        return this.#state.pipe(
            map(({ instance }) => instance as AppModulesInstance<TModules>),
            filterEmpty()
        );
    }

    //#endregion

    get state(): AppBundleState {
        // todo deep-freeze
        return this.#state.value;
    }

    get appKey(): string {
        return this.#state.value.appKey;
    }

    get manifest(): AppManifest | undefined {
        return this.state.manifest;
    }

    get manifestAsync(): Promise<AppManifest> {
        return firstValueFrom(this.manifest$);
    }

    get config(): AppConfig<TEnv> | undefined {
        return this.state.config;
    }

    get configAsync(): Promise<AppConfig<TEnv>> {
        return firstValueFrom(this.config$);
    }

    get instance(): AppModulesInstance<TModules> | undefined {
        return this.#state.value.instance as AppModulesInstance<TModules>;
    }

    constructor(
        value: AppBundleStateInitial,
        args: {
            provider: AppModuleProvider;
            event?: ModuleType<EventModule>;
        }
    ) {
        this.#state = createState(value, args.provider);

        const { appKey } = value;
        const { event } = args;

        event && this.#registerEvents(event);

        const subscriptions = new Subscription();
        if (event) {
            subscriptions.add(() => {
                event.dispatchEvent('onAppDispose', { detail: { appKey } });
            });
            subscriptions.add(
                event.addEventListener('onAppModulesLoaded', (e) => {
                    if (e.detail.appKey === appKey) {
                        this.#state.next(actions.setInstance(e.detail.modules));
                    }
                })
            );
        }

        this.dispose = () => {
            subscriptions?.unsubscribe();
            if (this.#state.value.instance) {
                /** tear down modules of application */
                this.#state.value.instance.dispose();
            }
            this.#state.complete();
        };
    }

    #registerEvents(event: ModuleType<EventModule>): void {
        const { appKey } = this;

        this.#state.addEffect(actions.fetchManifest.success.type, (action) => {
            event.dispatchEvent('onAppManifestLoaded', {
                detail: { appKey, manifest: action.payload },
                source: this,
            });
        });

        this.#state.addEffect(actions.fetchConfig.success.type, (action) => {
            event.dispatchEvent('onAppConfigLoaded', {
                detail: { appKey, manifest: action.payload },
                source: this,
            });
        });

        this.#state.addEffect(actions.importApp.success.type, (action) => {
            event.dispatchEvent('onAppScriptLoaded', {
                detail: { appKey, manifest: action.payload },
                source: this,
            });
        });

        this.#state.addEffect(actions.initialize.type, () => {
            event.dispatchEvent('onAppInitialize', {
                detail: { appKey },
                source: this,
            });
        });

        this.#state.addEffect(actions.initialize.success.type, () => {
            event.dispatchEvent('onAppInitialized', {
                detail: { appKey },
                source: this,
            });
        });

        this.#state.addEffect(actions.initialize.failure.type, ({ payload }) => {
            event.dispatchEvent('onAppInitializeFailed', {
                detail: { appKey, error: payload },
                source: this,
            });
        });
    }

    /**
     * The initializing request won`t trigger until subscribing to the returned observable
     *
     * @example
     * ```ts
     * app.initialize().subscribe({
     *  next: (value) => {
     *      value.script.render(el, ...);
     *  },
     *  error: (err) => console.error('failed to load application', err),
     *  complete: () => setInitializingApp(false)
     * })
     * ```
     */
    public initialize(): Observable<{
        manifest: AppManifest;
        script: AppScriptModule;
        config: AppConfig;
    }> {
        return new Observable((observer) => {
            this.#state.next(actions.initialize());
            observer.add(
                combineLatest([
                    this.getManifest(),
                    this.getAppModule(),
                    this.getConfig(),
                ]).subscribe({
                    next: ([manifest, script, config]) =>
                        observer.next({
                            manifest,
                            script,
                            config,
                        }),
                    error: (err) => {
                        observer.error(err), this.#state.next(actions.initialize.failure(err));
                    },
                    complete: () => {
                        this.#state.next(actions.initialize.success());
                        observer.complete();
                    },
                })
            );
        });
    }

    public loadConfig() {
        this.#state.next(actions.fetchConfig(this.appKey));
    }

    public loadManifest() {
        this.#state.next(actions.fetchManifest(this.appKey));
    }

    public async loadAppModule(allow_cache = true) {
        const manifest = await this.getManifestAsync(allow_cache);
        this.#state.next(actions.importApp(manifest.entry));
    }

    public getConfig(force_refresh = false): Observable<AppConfig> {
        return new Observable((subscriber) => {
            if (this.#state.value.config) {
                subscriber.next(this.#state.value.config);
                if (!force_refresh) {
                    return subscriber.complete();
                }
            }
            subscriber.add(
                this.#state.addEffect('set_config', ({ payload }) => {
                    subscriber.next(payload);
                })
            );
            subscriber.add(
                this.#state.addEffect('fetch_config::success', ({ payload }) => {
                    subscriber.next(payload);
                    subscriber.complete();
                })
            );
            subscriber.add(
                this.#state.addEffect('fetch_config::failure', ({ payload }) => {
                    subscriber.error(
                        Error('failed to load application config', {
                            cause: payload,
                        })
                    );
                })
            );

            this.loadConfig();
        });
    }

    public getConfigAsync(allow_cache = true): Promise<AppConfig> {
        const operator = allow_cache ? firstValueFrom : lastValueFrom;
        return operator(this.getConfig(!allow_cache));
    }

    public getManifest(force_refresh = false): Observable<AppManifest> {
        return new Observable((subscriber) => {
            if (this.#state.value.manifest) {
                subscriber.next(this.#state.value.manifest);
                if (!force_refresh) {
                    return subscriber.complete();
                }
            }
            subscriber.add(
                this.#state.addEffect('set_manifest', ({ payload }) => {
                    subscriber.next(payload);
                })
            );
            subscriber.add(
                this.#state.addEffect('fetch_manifest::success', ({ payload }) => {
                    subscriber.next(payload);
                    subscriber.complete();
                })
            );
            subscriber.add(
                this.#state.addEffect('fetch_manifest::failure', ({ payload }) => {
                    subscriber.error(
                        Error('failed to load application manifest', {
                            cause: payload,
                        })
                    );
                })
            );

            this.loadManifest();
        });
    }

    public getManifestAsync(allow_cache = true): Promise<AppManifest> {
        const operator = allow_cache ? firstValueFrom : lastValueFrom;
        return operator(this.getManifest(!allow_cache));
    }

    public getAppModule(force_refresh = false): Observable<AppScriptModule> {
        return new Observable((subscriber) => {
            if (this.#state.value.modules) {
                subscriber.next(this.#state.value.modules);
                if (!force_refresh) {
                    return subscriber.complete();
                }
            }
            subscriber.add(
                this.#state.addEffect('set_module', ({ payload }) => {
                    subscriber.next(payload);
                })
            );
            subscriber.add(
                this.#state.addEffect('import_app::success', ({ payload }) => {
                    subscriber.next(payload);
                    subscriber.complete();
                })
            );
            subscriber.add(
                this.#state.addEffect('import_app::failure', ({ payload }) => {
                    subscriber.error(
                        Error('failed to load application modules from script', {
                            cause: payload,
                        })
                    );
                })
            );

            subscriber.add(
                this.getManifest().subscribe((manifest) =>
                    of(this.#state.next(actions.importApp(manifest.entry)))
                )
            );
        });
    }

    public getAppModuleAsync(allow_cache = true): Promise<AppScriptModule> {
        const operator = allow_cache ? firstValueFrom : lastValueFrom;
        return operator(this.getAppModule(!allow_cache));
    }

    public dispose: VoidFunction;
}

export default App;
