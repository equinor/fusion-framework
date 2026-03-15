import type { ModuleType } from '@equinor/fusion-framework-module';
import type {
  GetWidgetParameters,
  WidgetConfig,
  WidgetManifest,
  WidgetScriptModule,
  WidgetState,
  WidgetStateInitial,
} from './types';
import { type Actions, actions } from './state/actions';
import type { FlowSubject } from '@equinor/fusion-observable';

import { createState } from './state/create-state';
import type { EventModule } from '@equinor/fusion-framework-module-event';
import { Observable, Subscription, combineLatest, firstValueFrom, lastValueFrom, of } from 'rxjs';
import type WidgetModuleProvider from './WidgetModuleProvider';
import type { WidgetModuleConfig } from './WidgetModuleConfigurator';

import './events';

/**
 * Manages the full lifecycle of a single Fusion widget.
 *
 * A `Widget` encapsulates fetching its manifest, dynamically importing its
 * script entry point, loading configuration, and emitting lifecycle events.
 * Internally it uses an RxJS-based `FlowSubject` state machine driven by
 * actions and flows defined in the `state/` directory.
 *
 * Create instances via {@link WidgetModuleProvider.getWidget} rather than
 * constructing directly.
 *
 * @example
 * ```typescript
 * const widget = provider.getWidget('my-widget');
 * widget.initialize().subscribe(({ manifest, script }) => {
 *   script.renderWidget(el, { fusion, env: { manifest } });
 * });
 * ```
 */
export class Widget {
  #state: FlowSubject<WidgetState, Actions>;

  /** Human-readable widget name used as the lookup key for manifest and config. */
  name: string;

  /** Module-level HTTP client configuration used to resolve asset URLs. */
  config?: WidgetModuleConfig;

  /** Optional version or tag parameters forwarded to manifest/config endpoints. */
  widgetPrams?: GetWidgetParameters['args'];

  #subscription = new Subscription();

  /** Current snapshot of the widget's internal state (manifest, config, modules, status). */
  get state(): WidgetState {
    return this.#state.value;
  }

  /**
   * Constructs a new `Widget` instance.
   *
   * Prefer using {@link WidgetModuleProvider.getWidget} instead of calling
   * this constructor directly.
   *
   * @param value - Initial widget state (at minimum, the widget `name`).
   * @param args - Dependencies required by the widget.
   * @param args.provider - The owning {@link WidgetModuleProvider}.
   * @param args.config - Optional module-level HTTP client configuration.
   * @param args.event - Optional event module for dispatching lifecycle events.
   * @param args.widgetPrams - Optional version/tag selector for the widget.
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
   * Retrieves the widget manifest as an observable stream.
   *
   * If the manifest is already cached in state it is emitted immediately.
   * When `force_refresh` is `true`, a new fetch is dispatched regardless of
   * cache status.
   *
   * @param force_refresh - When `true`, re-fetches the manifest even if cached.
   * @returns Observable that emits the {@link WidgetManifest} and completes.
   * @throws {Error} When the manifest fetch fails (wraps the underlying cause).
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
   * Retrieves the widget configuration as an observable stream.
   *
   * Returns the cached config immediately when available. Set `force_refresh`
   * to `true` to force a new fetch from the backend API.
   *
   * @param force_refresh - When `true`, re-fetches the config even if cached.
   * @returns Observable that emits the {@link WidgetConfig} and completes.
   * @throws {Error} When the config fetch fails (wraps the underlying cause).
   */
  public getConfig(force_refresh = false): Observable<WidgetConfig> {
    return new Observable((subscriber) => {
      const currentValue = this.#state.value;
      if (currentValue.manifest && currentValue.config) {
        subscriber.next(currentValue.config);
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
   * Dispatches a config fetch action into the state machine.
   *
   * @param update - When `true`, merges the fetched config with existing state
   *   instead of replacing it.
   */
  public loadConfig(update?: boolean) {
    this.#state.next(actions.fetchConfig({ key: this.name, ...this.widgetPrams }, update));
  }

  /**
   * Dispatches a manifest fetch action into the state machine.
   *
   * @param update - When `true`, merges the fetched manifest with existing
   *   state instead of replacing it.
   */
  public loadManifest(update?: boolean) {
    this.#state.next(actions.fetchManifest({ key: this.name, ...this.widgetPrams }, update));
  }

  /**
   * Retrieves the widget's script module as an observable stream.
   *
   * Resolves the manifest first, builds the full import URL from the asset
   * path and entry point, then dynamically imports the script. The imported
   * module is cached in state for subsequent calls.
   *
   * @param force_refresh - When `true`, re-imports the script even if cached.
   * @returns Observable that emits the {@link WidgetScriptModule} and completes.
   * @throws {Error} When the script import fails (wraps the underlying cause).
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
   * Initializes the widget by loading the manifest, importing the script, and
   * preparing configuration. Emits a combined result when all resources are ready.
   *
   * @returns Observable that emits `{ manifest, script, config }` and completes
   *   once all resources have been resolved.
   * @throws {Error} When any initialization step fails.
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
   * Retrieves the widget script module as a `Promise`.
   *
   * When `allow_cache` is `true` (default), resolves with the first emitted
   * value (which may be cached). When `false`, waits for the last emission
   * after a forced refresh.
   *
   * @param allow_cache - When `true`, uses `firstValueFrom`; when `false`,
   *   uses `lastValueFrom` after forcing a re-import.
   * @returns Promise that resolves with the {@link WidgetScriptModule}.
   */
  public getWidgetModuleAsync(allow_cache = true): Promise<WidgetScriptModule> {
    const operator = allow_cache ? firstValueFrom : lastValueFrom;
    return operator(this.getWidgetModule(!allow_cache));
  }
  /**
   * Replaces or merges the widget manifest in state.
   *
   * @param manifest - The new or partial manifest to set.
   * @param replace - When `false` (default), the new manifest is merged with
   *   the existing one. Pass explicit `false` to merge, or omit to merge.
   */
  public updateManifest(manifest: WidgetManifest, replace?: false) {
    this.#state.next(actions.setManifest(manifest, !replace));
  }

  /**
   * Disposes of the widget by unsubscribing from all internal subscriptions.
   *
   * After disposal the widget instance should not be reused.
   */
  public dispose() {
    this.#subscription.unsubscribe();
  }
}
