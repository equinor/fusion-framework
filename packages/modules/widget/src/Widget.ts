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

export class Widget {
    #state: FlowSubject<WidgetState, Actions>;
    name: string;
    config?: WidgetModuleConfig;
    widgetPrams?: GetWidgetParameters['args'];

    #subscription = new Subscription();

    get state(): WidgetState {
        return this.#state.value;
    }

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

    public loadConfig(update?: boolean) {
        this.#state.next(actions.fetchConfig({ key: this.name, ...this.widgetPrams }, update));
    }

    public loadManifest(update?: boolean) {
        this.#state.next(actions.fetchManifest({ key: this.name, ...this.widgetPrams }, update));
    }

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
                        ? `${manifest.assetPath}/${manifest.entryPoint}?api-version=${this.config?.apiVersion}`
                        : `${manifest.entryPoint}?api-version=${this.config?.apiVersion}`;

                    const url = new URL(path, this.config?.baseImportUrl);

                    return of(this.#state.next(actions.importWidget(url.href)));
                }),
            );
        });
    }

    public initialize(): Observable<{
        manifest: WidgetManifest;
        script: WidgetScriptModule;
        config: WidgetConfig;
    }> {
        //Add back Config to widget!!
        return new Observable((observer) => {
            this.#state.next(actions.initialize());
            observer.add(
                combineLatest([
                    this.getManifest(),
                    this.getWidgetModule(),
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
                }),
            );
        });
    }

    public getWidgetModuleAsync(allow_cache = true): Promise<WidgetScriptModule> {
        const operator = allow_cache ? firstValueFrom : lastValueFrom;
        return operator(this.getWidgetModule(!allow_cache));
    }

    public updateManifest(manifest: WidgetManifest, replace?: false) {
        this.#state.next(actions.setManifest(manifest, !replace));
    }

    public dispose() {
        this.#subscription.unsubscribe();
    }
}

// Todo Define All Events
