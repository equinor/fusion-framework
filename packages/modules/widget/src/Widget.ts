import { ModuleType } from '@equinor/fusion-framework-module';
import {
    GetWidgetParameters,
    WidgetConfig,
    WidgetManifest,
    WidgetScriptModule,
    WidgetState,
    WidgetStateInitial,
} from './types';
import { Actions, actions } from './state/actions';
import { FlowSubject } from '@equinor/fusion-observable';

import { createState } from './state/create-state';
import { EventModule } from '@equinor/fusion-framework-module-event';
import { Observable, Subscription, combineLatest, firstValueFrom, lastValueFrom, of } from 'rxjs';
import WidgetModuleProvider from './WidgetModuleProvider';
import { WidgetModuleConfig } from './WidgetModuleConfigurator';

import './events';

// Class representing a fusion widget
export class Widget {
    #state: FlowSubject<WidgetState, Actions>;
    name: string;
    config?: WidgetModuleConfig;
    widgetPrams?: GetWidgetParameters['args'];

    #subscription = new Subscription();

    // Getter for accessing the current state of the widget
    get state(): WidgetState {
        return this.#state.value;
    }

    /**
     * Constructs a new Widget instance.
     * @param value - Initial state of the widget.
     * @param args - Configuration and event parameters for the widget.
     */
    constructor(
        value: WidgetStateInitial,
        args: {
            provider: WidgetModuleProvider;
            config?: WidgetModuleConfig;
            event?: ModuleType<EventModule>;
            widgetPrams?: GetWidgetParameters['args'];
        },
    ) {
        this.name = value.name;
        this.widgetPrams = args.widgetPrams;
        this.config = args.config;
        this.#state = createState(value, args.provider);
        args.event && this.#registerEvents(args.event);
    }

    /**
     * Registers event listeners for various actions in the widget's state.
     * @param event - The event module to dispatch events.
     */
    #registerEvents(event: ModuleType<EventModule>): void {
        const { name } = this;

        this.#state.addEffect(actions.fetchManifest.type, () => {
            event.dispatchEvent('onWidgetManifestLoad', {
                detail: { name },
                source: this,
            });
        });
        this.#state.addEffect(actions.fetchManifest.success.type, (action) => {
            event.dispatchEvent('onWidgetManifestLoaded', {
                detail: { name, manifest: action.payload },
                source: this,
            });
        });
        this.#state.addEffect(actions.fetchManifest.failure.type, (action) => {
            event.dispatchEvent('onWidgetManifestFailure', {
                detail: { name, error: action.payload },
                source: this,
            });
        });

        this.#state.addEffect(actions.importWidget.type, () => {
            event.dispatchEvent('onWidgetScriptLoad', {
                detail: { name },
                source: this,
            });
        });
        this.#state.addEffect(actions.importWidget.success.type, (action) => {
            event.dispatchEvent('onWidgetScriptLoaded', {
                detail: { name, script: action.payload },
                source: this,
            });
        });
        this.#state.addEffect(actions.importWidget.failure.type, (action) => {
            event.dispatchEvent('onWidgetScriptFailure', {
                detail: { name, error: action.payload },
                source: this,
            });
        });

        this.#state.addEffect(actions.initialize.type, () => {
            event.dispatchEvent('onWidgetInitialize', {
                detail: { name },
                source: this,
            });
        });

        this.#state.addEffect(actions.initialize.success.type, () => {
            event.dispatchEvent('onWidgetInitialized', {
                detail: { name },
                source: this,
            });
        });

        this.#state.addEffect(actions.initialize.failure.type, ({ payload }) => {
            event.dispatchEvent('onWidgetInitializeFailure', {
                detail: { name, error: payload },
                source: this,
            });
        });
    }

    /**
     * Retrieves the manifest of the widget as an observable stream.
     * @param force_refresh - Flag to force refresh the manifest.
     * @returns An observable stream of the widget manifest.
     */
    public getManifest(force_refresh = false): Observable<WidgetManifest> {
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
                }),
            );
            subscriber.add(
                this.#state.addEffect('fetch_manifest::success', ({ payload }) => {
                    subscriber.next(payload);
                    subscriber.complete();
                }),
            );
            subscriber.add(
                this.#state.addEffect('fetch_manifest::failure', ({ payload }) => {
                    subscriber.error(
                        Error('failed to load widget manifest', {
                            cause: payload,
                        }),
                    );
                }),
            );

            this.loadManifest();
        });
    }

    /**
     * Retrieves the configuration of the widget as an observable stream.
     * @param force_refresh - Flag to force refresh the configuration.
     * @returns An observable stream of the widget configuration.
     */
    public getConfig(force_refresh = false): Observable<WidgetConfig> {
        return new Observable((subscriber) => {
            if (this.#state.value.manifest) {
                subscriber.next(this.#state.value.config);
                if (!force_refresh) {
                    return subscriber.complete();
                }
            }
            subscriber.add(
                this.#state.addEffect('set_config', ({ payload }) => {
                    subscriber.next(payload);
                }),
            );
            subscriber.add(
                this.#state.addEffect('fetch_config::success', ({ payload }) => {
                    subscriber.next(payload);
                    subscriber.complete();
                }),
            );
            subscriber.add(
                this.#state.addEffect('fetch_config::failure', ({ payload }) => {
                    subscriber.error(
                        Error('failed to load widget manifest', {
                            cause: payload,
                        }),
                    );
                }),
            );

            this.loadConfig();
        });
    }

    /**
     * Loads the configuration for the widget.
     * @param update - Flag to force an update of the configuration.
     */
    public loadConfig(update?: boolean) {
        this.#state.next(actions.fetchConfig({ key: this.name, ...this.widgetPrams }, update));
    }

    /**
     * Loads the manifest for the widget.
     * @param update - Flag to force an update of the manifest.
     */
    public loadManifest(update?: boolean) {
        this.#state.next(actions.fetchManifest({ key: this.name, ...this.widgetPrams }, update));
    }

    /**
     * Retrieves the widget module as an observable stream.
     * @param force_refresh - Flag to force refresh the widget module.
     * @returns An observable stream of the widget module.
     */
    public getWidgetModule(force_refresh = false): Observable<WidgetScriptModule> {
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
                }),
            );
            subscriber.add(
                this.#state.addEffect('import_widget::success', ({ payload }) => {
                    subscriber.next(payload);
                    subscriber.complete();
                }),
            );
            subscriber.add(
                this.#state.addEffect('import_widget::failure', ({ payload }) => {
                    subscriber.error(
                        Error('failed to load widget modules from script', {
                            cause: payload,
                        }),
                    );
                }),
            );

            subscriber.add(
                this.getManifest().subscribe((manifest) => {
                    const path = manifest.assetPath
                        ? `${manifest.assetPath}/${manifest.entryPoint}?api-version=${this.config?.client.apiVersion}`
                        : `${manifest.entryPoint}?api-version=${this.config?.client.apiVersion}`;

                    const url = new URL(path, this.config?.client.baseImportUrl);

                    return of(this.#state.next(actions.importWidget(url.href)));
                }),
            );
        });
    }
    /**
     * Initializes the widget and returns an observable stream with the combined results.
     * @returns An observable stream with the manifest, script, and configuration.
     */
    public initialize(): Observable<{
        manifest: WidgetManifest;
        script: WidgetScriptModule;
        config?: WidgetConfig;
    }> {
        return new Observable((observer) => {
            this.#state.next(actions.initialize());
            observer.add(
                combineLatest([
                    this.getManifest(),
                    this.getWidgetModule(),
                    // this.getConfig(),
                ]).subscribe({
                    next: ([manifest, script]) =>
                        observer.next({
                            manifest,
                            script,
                            //Todo: uncomment the getConfig on line #273 and replace config when backend support widget config.
                            config: {
                                environment: {},
                                endpoints: {},
                            },
                        }),
                    error: (err) => {
                        observer.error(err), this.#state.next(actions.initialize.failure(err));
                    },
                    complete: () => {
                        this.#state.next(actions.initialize.success());
                        observer.complete();
                    },
                }),
            );
        });
    }
    /**
     * Retrieves the widget module asynchronously as a Promise.
     * @param allow_cache - Flag to allow caching of the widget module.
     * @returns A Promise containing the widget module.
     */
    public getWidgetModuleAsync(allow_cache = true): Promise<WidgetScriptModule> {
        const operator = allow_cache ? firstValueFrom : lastValueFrom;
        return operator(this.getWidgetModule(!allow_cache));
    }
    /**
     * Updates the manifest of the widget.
     * @param manifest - The new manifest for the widget.
     * @param replace - Flag to replace the existing manifest.
     */
    public updateManifest(manifest: WidgetManifest, replace?: false) {
        this.#state.next(actions.setManifest(manifest, !replace));
    }

    /**
     * Disposes of the widget by unsubscribing from any active subscriptions.
     */
    public dispose() {
        this.#subscription.unsubscribe();
    }
}
