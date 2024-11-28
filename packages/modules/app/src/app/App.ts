import type {
    AppModulesInstance,
    AppScriptModule,
    AppManifest,
    AppConfig,
    AppSettings,
    ConfigEnvironment,
} from '../types';
import { FlowSubject, Observable } from '@equinor/fusion-observable';

import type { AppModuleProvider } from '../AppModuleProvider';
import {
    combineLatest,
    of,
    type OperatorFunction,
    Subscription,
    firstValueFrom,
    lastValueFrom,
} from 'rxjs';
import { defaultIfEmpty, filter, map, switchMap } from 'rxjs/operators';

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

/**
 * Represents an application in the framework.
 * @template TEnv The type of the environment.
 * @template TModules The type of the app modules.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IApp<
    TEnv extends ConfigEnvironment = ConfigEnvironment,
    TModules extends Array<AnyModule> | unknown = unknown,
> {
    /**
     * Returns an observable that emits the app manifest.
     * @returns An observable of type AppManifest.
     */
    get manifest$(): Observable<AppManifest>;

    /**
     * Observable that emits the configuration of the app.
     * @returns An Observable that emits the app configuration.
     */
    get config$(): Observable<AppConfig<TEnv>>;

    /**
     * Returns an observable stream of the loaded app script instance.
     * @returns {Observable<AppScriptModule>} The observable stream of app script modules.
     */
    get modules$(): Observable<AppScriptModule>;

    /**
     * Returns an observable that emits the instance of the app modules.
     * @returns An observable that emits the instance of the app modules.
     */
    get instance$(): Observable<AppModulesInstance<TModules>>;

    /**
     * Observable that emits the settings of the app.
     * @returns An Observable that emits the app setttings.
     */
    get settings$(): Observable<AppSettings>;

    /**
     * Gets the current state of the Application.
     * @returns The current state of the Application.
     */
    get state(): AppBundleState;

    /**
     * Gets the app key.
     * @returns The app key.
     */
    get appKey(): string;

    /**
     * Gets the manifest of the app.
     * @returns The manifest of the app, or undefined if it doesn't exist.
     */
    get manifest(): Readonly<AppManifest> | undefined;

    /**
     * Retrieves the manifest asynchronously.
     * @returns A promise that resolves to the AppManifest.
     */
    get manifestAsync(): Promise<Readonly<AppManifest>>;

    /**
     * Gets the configuration of the app.
     * @returns The configuration object or undefined if no configuration is set.
     */
    get config(): AppConfig<TEnv> | undefined;

    /**
     * Retrieves the configuration asynchronously.
     * @returns A promise that resolves to the AppConfig.
     */
    get instance(): AppModulesInstance<TModules> | undefined;

    /**
     * Initializes the application container.
     * @returns An observable that emits an object containing the manifest, script, and config.
     * @example
     * ```typescript
     * app.initialize().subscribe({
     *   next: ({ manifest, script, config }) => {
     *     // Use the manifest, script, and config to initialize the application
     *     script.render(el, ...);
     *   },
     *   error: (err) => console.error('Failed to load application', err),
     *   complete: () => setInitializingApp(false)
     * });
     * ```
     */
    initialize(): Observable<{
        manifest: AppManifest;
        script: AppScriptModule;
        config: AppConfig;
    }>;

    /**
     * Loads the app configuration.
     */
    loadConfig(): void;

    /**
     * Loads the app manifest.
     */
    loadManifest(): void;

    /**
     * Loads the app module.
     * @param allow_cache Whether to allow loading from cache.
     */
    loadAppModule(allow_cache?: boolean): void;

    /**
     * Gets the app configuration.
     * @param force_refresh Whether to force refreshing the configuration.
     * @returns An observable that emits the app configuration.
     */
    getConfig(force_refresh?: boolean): Observable<AppConfig>;

    /**
     * Retrieves the app configuration asynchronously.
     * @param allow_cache Whether to allow loading from cache.
     * @returns A promise that resolves to the AppConfig.
     */
    getConfigAsync(allow_cache?: boolean): Promise<AppConfig>;

    /**
     * Gets the app settings.
     * @param force_refresh Whether to force refreshing the settings.
     * @returns An observable that emits the app settings.
     */
    getSettings(force_refresh?: boolean): Observable<AppSettings>;

    /**
     * Retrieves the app settings asynchronously.
     * @param allow_cache Whether to allow loading from cache.
     * @returns A promise that resolves to the AppSettings.
     */
    getSettingsAsync(allow_cache?: boolean): Promise<AppSettings>;

    /**
     * Sets the app settings.
     * @param settings The settings object to save.
     * @returns An observable that emits the app settings.
     */
    updateSettings(settings: AppSettings): Observable<AppSettings>;

    /**
     * Sets the app settings asyncronously.
     * @param settings The settings object to save.
     * @returns An Promise that resolves the app settings.
     */
    updateSettingsAsync(settings: AppSettings): Promise<AppSettings>;

    /**
     * Updates a specific setting of the app.
     * @param property The property to update.
     * @param value The value to set.
     * @returns An observable that emits the app settings.
     */
    updateSetting<T extends keyof AppSettings>(
        property: T,
        value: AppSettings[T],
    ): Observable<AppSettings[T]>;

    /**
     * Updates a specific setting of the app asynchronously.
     * @param property The property to update.
     * @param value The value to set.
     * @returns A promise that resolves to the AppSettings.
     */
    updateSettingAsync<T extends keyof AppSettings>(
        property: T,
        value: AppSettings[T],
    ): Promise<AppSettings[T]>;

    /**
     * Gets the app manifest.
     * @param force_refresh Whether to force refreshing the manifest.
     * @returns An observable that emits the app manifest.
     */
    getManifest(force_refresh?: boolean): Observable<AppManifest>;

    /**
     * Retrieves the app manifest asynchronously.
     * @param allow_cache Whether to allow loading from cache.
     * @returns A promise that resolves to the AppManifest.
     */
    getManifestAsync(allow_cache?: boolean): Promise<AppManifest>;

    /**
     * Gets the app module.
     * @param force_refresh Whether to force refreshing the app module.
     * @returns An observable that emits the app module.
     */
    getAppModule(force_refresh?: boolean): Observable<AppScriptModule>;

    /**
     * Retrieves the app module asynchronously.
     * @param allow_cache Whether to allow loading from cache.
     * @returns A promise that resolves to the AppScriptModule.
     */
    getAppModuleAsync(allow_cache?: boolean): Promise<AppScriptModule>;
}

const fallbackSettings: AppSettings = {};

// TODO make streams distinct until changed from state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class App<
    TEnv extends ConfigEnvironment = ConfigEnvironment,
    TModules extends Array<AnyModule> | unknown = unknown,
> implements IApp<TEnv, TModules>
{
    #state: FlowSubject<AppBundleState, Actions>;

    //#region === streams ===

    get manifest$(): Observable<AppManifest> {
        return this.#state.select((state) => state.manifest).pipe(filterEmpty());
    }

    get config$(): Observable<AppConfig<TEnv>> {
        return this.#state.select((state) => state.config as AppConfig<TEnv>).pipe(filterEmpty());
    }

    get modules$(): Observable<AppScriptModule> {
        return this.#state.select((state) => state.modules).pipe(filterEmpty());
    }

    get instance$(): Observable<AppModulesInstance<TModules>> {
        return this.#state
            .select((state) => state.instance as AppModulesInstance<TModules>)
            .pipe(filterEmpty());
    }

    get settings$(): Observable<AppSettings> {
        return new Observable<AppSettings>((subscriber) => {
            this.#state.next(actions.fetchSettings(this.appKey));
            subscriber.add(
                this.#state
                    .select((state) => state.settings)
                    .pipe(filterEmpty(), defaultIfEmpty(fallbackSettings))
                    .subscribe(subscriber),
            );
        });
    }

    //#endregion

    get state(): Readonly<AppBundleState> {
        // todo deep-freeze
        return Object.freeze(this.#state.value) as Readonly<AppBundleState>;
    }

    get appKey(): string {
        return this.#state.value.appKey;
    }

    get manifest(): Readonly<AppManifest> | undefined {
        return this.state.manifest;
    }

    get manifestAsync(): Promise<Readonly<AppManifest>> {
        return firstValueFrom(this.manifest$);
    }

    get config(): AppConfig<TEnv> | undefined {
        return this.state.config as AppConfig<TEnv>;
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
        },
    ) {
        this.#state = createState(value, args.provider);

        const { appKey } = value;
        const { event } = args;

        // register events if event module is provided
        event && this.#registerEvents(event);

        // create a tear down handler for the application
        const subscriptions = new Subscription();

        if (event) {
            // when app is disposed, dispatch event to notify listeners
            subscriptions.add(() => {
                event.dispatchEvent('onAppDispose', { detail: { appKey } });
            });

            // when disposed, dispose of monitoring of app modules loaded
            subscriptions.add(
                event.addEventListener('onAppModulesLoaded', (e) => {
                    // validate that the event is for the current app
                    if (e.detail.appKey === appKey) {
                        // set the instance of the app modules
                        this.#state.next(actions.setInstance(e.detail.modules));
                    }
                }),
            );
        }

        this.dispose = () => {
            subscriptions?.unsubscribe();
            if (this.#state.value.instance) {
                // tear down modules of application
                this.#state.value.instance.dispose();
            }
            this.#state.complete();
        };
    }

    /**
     * Registers event listeners for various actions in the app.
     * @param event - The event module used for dispatching events.
     */
    #registerEvents(event: ModuleType<EventModule>): void {
        const { appKey } = this;

        // monitor when application manifest is loading
        this.#state.addEffect(actions.fetchManifest.type, () => {
            // dispatch event to notify listeners that the application manifest is being loaded
            event.dispatchEvent('onAppManifestLoad', {
                detail: { appKey },
                source: this,
            });
        });

        // monitor when application manifest is loaded
        this.#state.addEffect(actions.fetchManifest.success.type, (action) => {
            // dispatch event to notify listeners that the application manifest has been loaded
            event.dispatchEvent('onAppManifestLoaded', {
                detail: { appKey, manifest: action.payload },
                source: this,
            });
        });

        // monitor when application manifest fails to load
        this.#state.addEffect(actions.fetchManifest.failure.type, (action) => {
            // dispatch event to notify listeners that the application manifest failed to load
            event.dispatchEvent('onAppManifestFailure', {
                detail: { appKey, error: action.payload },
                source: this,
            });
        });

        // monitor when application configuration is loading
        this.#state.addEffect(actions.fetchConfig.type, () => {
            // dispatch event to notify listeners that the application configuration is being loaded
            event.dispatchEvent('onAppConfigLoad', {
                detail: { appKey },
                source: this,
            });
        });

        // monitor when application configuration is loaded
        this.#state.addEffect(actions.fetchConfig.success.type, (action) => {
            // dispatch event to notify listeners that the application configuration has been loaded
            event.dispatchEvent('onAppConfigLoaded', {
                detail: { appKey, config: action.payload },
                source: this,
            });
        });

        // monitor when application configuration fails to load
        this.#state.addEffect(actions.fetchConfig.failure.type, (action) => {
            // dispatch event to notify listeners that the application configuration failed to load
            event.dispatchEvent('onAppConfigFailure', {
                detail: { appKey, error: action.payload },
                source: this,
            });
        });

        // monitor when application settings is loading
        this.#state.addEffect(actions.fetchSettings.type, () => {
            // dispatch event to notify listeners that the application settings is being loaded
            event.dispatchEvent('onAppSettingsLoad', {
                detail: { appKey },
                source: this,
            });
        });

        // monitor when application settings is loaded
        this.#state.addEffect(actions.fetchSettings.success.type, (action) => {
            // dispatch event to notify listeners that the application settings has been loaded
            event.dispatchEvent('onAppSettingsLoaded', {
                detail: { appKey, settings: action.payload },
                source: this,
            });
        });

        // monitor when application settings fails to load
        this.#state.addEffect(actions.fetchSettings.failure.type, (action) => {
            // dispatch event to notify listeners that the application settings failed to load
            event.dispatchEvent('onAppSettingsFailure', {
                detail: { appKey, error: action.payload },
                source: this,
            });
        });

        // monitor when application settings is updated
        this.#state.addEffect(actions.updateSettings.type, (action) => {
            // dispatch event to notify listeners that the application settings has been loaded
            event.dispatchEvent('onAppSettingsUpdate', {
                detail: { appKey, settings: action.payload.settings },
                source: this,
            });
        });

        // monitor when application settings is updated
        this.#state.addEffect(actions.updateSettings.success.type, (action) => {
            // dispatch event to notify listeners that the application settings has been loaded
            event.dispatchEvent('onAppSettingsUpdated', {
                detail: { appKey, settings: action.payload.settings },
                source: this,
            });
        });

        // monitor when application settings fails to updated
        this.#state.addEffect(actions.updateSettings.failure.type, (action) => {
            // dispatch event to notify listeners that the application settings has been loaded
            event.dispatchEvent('onAppSettingsUpdateFailure', {
                detail: { appKey, settings: action.payload },
                source: this,
            });
        });

        // monitor when application script is loading
        this.#state.addEffect(actions.importApp.type, () => {
            // dispatch event to notify listeners that the application script is being loaded
            event.dispatchEvent('onAppScriptLoad', {
                detail: { appKey },
                source: this,
            });
        });

        // monitor when application script is loaded
        this.#state.addEffect(actions.importApp.success.type, (action) => {
            // dispatch event to notify listeners that the application script has been loaded
            event.dispatchEvent('onAppScriptLoaded', {
                detail: { appKey, script: action.payload },
                source: this,
            });
        });

        // monitor when application script fails to load
        this.#state.addEffect(actions.importApp.failure.type, (action) => {
            // dispatch event to notify listeners that the application script failed to load
            event.dispatchEvent('onAppScriptFailure', {
                detail: { appKey, error: action.payload },
                source: this,
            });
        });

        // monitor when application is initializing
        this.#state.addEffect(actions.initialize.type, () => {
            // dispatch event to notify listeners that the application is initializing
            event.dispatchEvent('onAppInitialize', {
                detail: { appKey },
                source: this,
            });
        });

        // monitor when application has been initialized
        this.#state.addEffect(actions.initialize.success.type, () => {
            // dispatch event to notify listeners that the application has been initialized
            event.dispatchEvent('onAppInitialized', {
                detail: { appKey },
                source: this,
            });
        });

        // monitor when application fails to initialize
        this.#state.addEffect(actions.initialize.failure.type, ({ payload }) => {
            // dispatch event to notify listeners that the application failed to initialize
            event.dispatchEvent('onAppInitializeFailure', {
                detail: { appKey, error: payload },
                source: this,
            });
        });
    }

    public initialize(): Observable<{
        manifest: AppManifest;
        script: AppScriptModule;
        config: AppConfig;
    }> {
        return new Observable((subscriber) => {
            // dispatch initialize action to indicate that the application is initializing
            this.#state.next(actions.initialize());
            subscriber.add(
                // request latest manifest, application script, and configuration
                combineLatest([
                    this.getManifest(),
                    this.getAppModule(),
                    this.getConfig(),
                ]).subscribe({
                    next: ([manifest, script, config]) =>
                        // emit the manifest, script, and config to the subscriber
                        subscriber.next({
                            manifest,
                            script,
                            config,
                        }),
                    error: (err) => {
                        // emit error and complete the stream
                        subscriber.error(err), this.#state.next(actions.initialize.failure(err));
                    },
                    complete: () => {
                        // dispatch initialize success action to indicate that the application has been initialized
                        this.#state.next(actions.initialize.success());
                        subscriber.complete();
                    },
                }),
            );
        });
    }

    public loadConfig() {
        // TODO - shit fix
        (this.manifest ? of(this.manifest) : this.getManifest()).subscribe({
            next: (manifest) => {
                this.#state.next(actions.fetchConfig(manifest));
            },
        });
    }

    public loadManifest(update?: boolean) {
        this.#state.next(actions.fetchManifest(this.appKey, update));
    }

    public updateManifest(manifest: AppManifest, replace?: false) {
        this.#state.next(actions.setManifest(manifest, !replace));
    }

    public async loadAppModule(allow_cache = true) {
        const manifest = await this.getManifestAsync(allow_cache);
        if (manifest.build?.entryPoint) {
            this.#state.next(actions.importApp(manifest.build.entryPoint));
        } else {
            console.log(
                `The ${manifest.appKey} is missing entryPoint, please upload a build for the app before continuing`,
            );
        }
    }

    public getConfig(force_refresh = false): Observable<AppConfig> {
        return new Observable((subscriber) => {
            if (this.#state.value.config) {
                // emit current config to the subscriber
                subscriber.next(this.#state.value.config);
                if (!force_refresh) {
                    // since we have the config and no force refresh, complete the stream
                    return subscriber.complete();
                }
            }

            // when stream closes, dispose of subscription to change of state config
            subscriber.add(
                // monitor changes to state changes of config and emit to subscriber
                this.#state.addEffect('set_config', ({ payload }) => {
                    subscriber.next(payload);
                }),
            );

            // when stream closes, dispose of subscription to fetch config
            subscriber.add(
                // monitor success of fetching config and emit to subscriber
                this.#state.addEffect('fetch_config::success', ({ payload }) => {
                    // application config loaded, emit to subscriber and complete the stream
                    subscriber.next(payload);
                    subscriber.complete();
                }),
            );

            // when stream closes, dispose of subscription to fetch config
            subscriber.add(
                // monitor failure of fetching config and emit error to subscriber
                this.#state.addEffect('fetch_config::failure', ({ payload }) => {
                    // application config failed to load, emit error and complete the stream
                    subscriber.error(
                        Error('failed to load application config', {
                            cause: payload,
                        }),
                    );
                }),
            );

            this.loadConfig();
        });
    }

    public getConfigAsync(allow_cache = true): Promise<AppConfig> {
        // when allow_cache is true, use first emitted value, otherwise use last emitted value
        const operator = allow_cache ? firstValueFrom : lastValueFrom;
        return operator(this.getConfig(!allow_cache));
    }

    public getSettings(force_refresh = false): Observable<AppSettings> {
        return new Observable((subscriber) => {
            if (this.#state.value.settings) {
                // emit current settings to the subscriber
                subscriber.next(this.#state.value.settings);
                if (!force_refresh) {
                    // since we have the settings and no force refresh, complete the stream
                    return subscriber.complete();
                }
            }

            // when stream closes, dispose of subscription to change of state settings
            subscriber.add(
                // monitor changes to state changes of settings and emit to subscriber
                this.#state.addEffect('set_settings', ({ payload }) => {
                    subscriber.next(payload);
                }),
            );

            // when stream closes, dispose of subscription to fetch settings
            subscriber.add(
                // monitor success of fetching settings and emit to subscriber
                this.#state.addEffect('fetch_settings::success', ({ payload }) => {
                    // application settings loaded, emit to subscriber and complete the stream
                    subscriber.next(payload);
                    subscriber.complete();
                }),
            );

            // when stream closes, dispose of subscription to fetch settings
            subscriber.add(
                // monitor failure of fetching settings and emit error to subscriber
                this.#state.addEffect('fetch_settings::failure', ({ payload }) => {
                    // application settings failed to load, emit error and complete the stream
                    subscriber.error(
                        Error('failed to load application settings', {
                            cause: payload,
                        }),
                    );
                }),
            );

            this.#state.next(actions.fetchSettings(this.appKey));
        });
    }

    public getSettingsAsync(allow_cache = true): Promise<AppSettings> {
        // when allow_cache is true, use first emitted value, otherwise use last emitted value
        const operator = allow_cache ? firstValueFrom : lastValueFrom;
        return operator(this.getSettings(!allow_cache));
    }

    public updateSettings(settings: AppSettings): Observable<AppSettings> {
        const action = actions.updateSettings(settings);

        const updateActions$ = this.#state.action$.pipe(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            filter((a) => action.meta.id === a.meta?.id),
        );

        return new Observable((subscriber) => {
            subscriber.add(
                updateActions$
                    .pipe(filter((a) => a.type === actions.updateSettings.success.type))
                    .subscribe(subscriber),
            );

            subscriber.add(
                updateActions$
                    .pipe(filter((a) => a.type === actions.updateSettings.failure.type))
                    .subscribe(({ payload }) => {
                        // application settings failed to save, emit error and complete the stream
                        subscriber.error(
                            Error('failed to load application settings', {
                                cause: payload,
                            }),
                        );
                    }),
            );

            this.#state.next(actions.updateSettings(settings));
        });
    }

    public updateSettingsAsync(settings: AppSettings): Promise<AppSettings> {
        return lastValueFrom(this.updateSettings(settings));
    }

    public updateSetting<T extends keyof AppSettings>(
        property: T,
        value: AppSettings[T],
    ): Observable<AppSettings[T]> {
        return this.getSettings().pipe(
            map((settings) => ({ ...settings, [property]: value })),
            switchMap((settings) => this.updateSettings(settings)),
            map((settings) => settings[property]),
        );
    }

    public updateSettingAsync<T extends keyof AppSettings>(
        property: T,
        value: AppSettings[T],
    ): Promise<AppSettings[T]> {
        return lastValueFrom(this.updateSetting(property, value));
    }

    public getManifest(force_refresh = false): Observable<AppManifest> {
        return new Observable((subscriber) => {
            if (this.#state.value.manifest) {
                // emit current manifest to the subscriber
                subscriber.next(this.#state.value.manifest);
                if (!force_refresh) {
                    // since we have the manifest and no force refresh, complete the stream
                    return subscriber.complete();
                }
            }
            // when stream closes, dispose of subscription to change of state manifest
            subscriber.add(
                // monitor changes to state changes of manifest and emit to subscriber
                this.#state.addEffect('set_manifest', ({ payload }) => {
                    subscriber.next(payload);
                }),
            );

            // when stream closes, dispose of subscription to fetch manifest
            subscriber.add(
                // monitor success of fetching manifest and emit to subscriber
                this.#state.addEffect('fetch_manifest::success', ({ payload }) => {
                    subscriber.next(payload);
                    // application manifest loaded, complete the stream
                    subscriber.complete();
                }),
            );
            subscriber.add(
                // monitor failure of fetching manifest and emit error to subscriber
                this.#state.addEffect('fetch_manifest::failure', ({ payload }) => {
                    // application manifest failed to load, emit error and complete the stream
                    subscriber.error(
                        Error('failed to load application manifest', {
                            cause: payload,
                        }),
                    );
                }),
            );

            // fetch the application manifest
            this.loadManifest();
        });
    }

    public getManifestAsync(allow_cache = true): Promise<AppManifest> {
        // when allow_cache is true, use first emitted value, otherwise use last emitted value
        const operator = allow_cache ? firstValueFrom : lastValueFrom;
        return operator(this.getManifest(!allow_cache));
    }

    public getAppModule(force_refresh = false): Observable<AppScriptModule> {
        return new Observable((subscriber) => {
            if (this.#state.value.modules) {
                // emit current value to the subscriber
                subscriber.next(this.#state.value.modules);
                if (!force_refresh) {
                    // complete if no force refresh
                    return subscriber.complete();
                }
            }

            // when stream closes, dispose of subscription to change of state modules
            subscriber.add(
                // monitor changes to state changes of modules and emit to subscriber
                this.#state.addEffect('set_module', ({ payload }) => {
                    subscriber.next(payload);
                }),
            );

            // when stream closes, dispose of subscription script load success
            subscriber.add(
                // monitor success of loading application script and emit to subscriber
                this.#state.addEffect('import_app::success', ({ payload }) => {
                    subscriber.next(payload);
                    // application module loaded, complete the stream
                    subscriber.complete();
                }),
            );

            // when stream closes, dispose of subscription to script load failure
            subscriber.add(
                // monitor failure of loading application script and emit error to subscriber
                this.#state.addEffect('import_app::failure', ({ payload }) => {
                    // application module failed to load, emit error and complete the stream
                    subscriber.error(
                        Error('failed to load application modules from script', {
                            cause: payload,
                        }),
                    );
                }),
            );

            // when stream closes, dispose of subscription to fetch manifest
            subscriber.add(
                // fetch application latest manifest and request loading of the application script
                this.getManifest().subscribe((manifest) => {
                    if (manifest.build?.entryPoint) {
                        // TODO - this should come from backend
                        const assetPath =
                            manifest.build.assetPath ??
                            [manifest.appKey, manifest.build.version].join('@');
                        // dispatch import_app action to load the application script
                        this.#state.next(
                            actions.importApp([assetPath, manifest.build.entryPoint].join('/')),
                        );
                    } else {
                        console.error(
                            `The ${manifest.appKey} app is missing a entry in the manifest, upload a build for your app before continuing`,
                        );
                    }
                }),
            );
        });
    }

    public getAppModuleAsync(allow_cache = true): Promise<AppScriptModule> {
        // when allow_cache is true, use first emitted value, otherwise use last emitted value
        const operator = allow_cache ? firstValueFrom : lastValueFrom;
        return operator(this.getAppModule(!allow_cache));
    }

    public dispose: VoidFunction;
}

export default App;
