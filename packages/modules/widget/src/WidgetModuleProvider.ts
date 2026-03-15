import { catchError, type Observable, Subscription } from 'rxjs';

import type { ModuleType } from '@equinor/fusion-framework-module';
import { HttpResponseError } from '@equinor/fusion-framework-module-http';
import type { EventModule } from '@equinor/fusion-framework-module-event';

import { Query } from '@equinor/fusion-query';

import type { GetWidgetParameters, WidgetConfig, WidgetManifest } from './types';

import type { WidgetModuleConfig } from './WidgetModuleConfigurator';
import { WidgetManifestLoadError, WidgetConfigLoadError } from './errors';
import { Widget } from './Widget';

/**
 * Public interface for the widget module provider.
 *
 * Consumers depend on this interface rather than the concrete
 * {@link WidgetModuleProvider} class, enabling testability and
 * alternative implementations.
 */
export interface IWidgetModuleProvider {
  /**
   * Creates a {@link Widget} instance for the given widget key.
   *
   * @param widgetKey - Unique identifier (name) of the widget.
   * @param args - Optional version or tag selector.
   * @returns A new `Widget` ready for initialization.
   */
  getWidget(
    widgetKey: GetWidgetParameters['widgetKey'],
    args?: GetWidgetParameters['args'],
  ): Widget;

  /**
   * Fetches the manifest for a widget as an observable stream.
   *
   * @param widgetKey - Unique identifier (name) of the widget.
   * @param args - Optional version or tag selector.
   * @returns Observable that emits the {@link WidgetManifest}.
   */
  getWidgetManifest(
    widgetKey: GetWidgetParameters['widgetKey'],
    args?: GetWidgetParameters['args'],
  ): Observable<WidgetManifest>;

  /**
   * Fetches the configuration for a widget as an observable stream.
   *
   * @param widgetKey - Unique identifier (name) of the widget.
   * @param args - Optional version or tag selector.
   * @returns Observable that emits the {@link WidgetConfig}.
   */
  getWidgetConfig(
    widgetKey: GetWidgetParameters['widgetKey'],
    args?: GetWidgetParameters['args'],
  ): Observable<WidgetConfig>;
}

/**
 * Concrete provider that manages widget instances and performs API queries
 * for widget manifests and configurations.
 *
 * Created automatically during module initialization; see {@link module} and
 * {@link enableWidgetModule}.
 *
 * @example
 * ```typescript
 * const widget = provider.getWidget('my-widget');
 * widget.initialize().subscribe(result => { ... });
 * ```
 */
export class WidgetModuleProvider implements IWidgetModuleProvider {
  // Private fields
  #subscription = new Subscription();
  #config: WidgetModuleConfig;
  #event?: ModuleType<EventModule>;

  /**
   * Creates a new `WidgetModuleProvider`.
   *
   * @param args - Provider dependencies.
   * @param args.config - Resolved {@link WidgetModuleConfig} with HTTP client.
   * @param args.event - Optional event module for dispatching lifecycle events.
   */
  constructor(args: { config: WidgetModuleConfig; event?: ModuleType<EventModule> }) {
    const { config, event } = args;
    this.#event = event;
    this.#config = config;
  }

  /**
   * Creates a new {@link Widget} instance for the given name.
   *
   * The returned widget has not been initialized yet — call
   * {@link Widget.initialize} to start the lifecycle.
   *
   * @param name - Unique widget name (used as lookup key).
   * @param widgetPrams - Optional version or tag selector.
   * @returns A new `Widget` instance.
   */
  public getWidget(name: string, widgetPrams?: GetWidgetParameters['args']): Widget {
    return new Widget(
      { name },
      { provider: this, event: this.#event, widgetPrams, config: this.#config },
    );
  }

  /**
   * Fetches the manifest for a widget via the configured HTTP client.
   *
   * @param name - Unique widget name.
   * @param widgetPrams - Optional version or tag selector.
   * @returns Observable that emits the {@link WidgetManifest} and completes.
   * @throws {WidgetManifestLoadError} When the manifest request fails.
   */
  public getWidgetManifest(
    name: string,
    widgetPrams?: GetWidgetParameters['args'],
  ): Observable<WidgetManifest> {
    return this._getWidget(name, widgetPrams);
  }

  /**
   * Fetches the configuration for a widget via the configured HTTP client.
   *
   * @param name - Unique widget name.
   * @param widgetPrams - Optional version or tag selector.
   * @returns Observable that emits the {@link WidgetConfig} and completes.
   * @throws {WidgetConfigLoadError} When the config request fails.
   */
  public getWidgetConfig(
    name: string,
    widgetPrams?: GetWidgetParameters['args'],
  ): Observable<WidgetConfig> {
    return this._getWidgetConfig(name, widgetPrams);
  }

  /**
   * Internal: queries widget config from the API and maps HTTP errors to
   * typed {@link WidgetConfigLoadError} instances.
   *
   * @param widgetKey - Widget identifier.
   * @param args - Optional version or tag selector.
   * @returns Observable emitting the {@link WidgetConfig}.
   */
  protected _getWidgetConfig(
    widgetKey: GetWidgetParameters['widgetKey'],
    args?: GetWidgetParameters['args'],
  ): Observable<WidgetConfig> {
    const client = new Query(this.#config.client.getWidgetConfig);
    this.#subscription.add(() => client.complete());
    return Query.extractQueryValue(
      client.query({ widgetKey, args }).pipe(
        catchError((err) => {
          // Extract the cause since the error will be a `QueryError`
          const { cause } = err;

          // Handle specific errors and throw a `GetWidgetManifestError` if applicable
          if (cause instanceof WidgetManifestLoadError) {
            throw cause;
          }
          if (cause instanceof HttpResponseError) {
            throw WidgetManifestLoadError.fromHttpResponse(cause.response, {
              cause,
            });
          }
          // Throw a generic `GetWidgetManifestError` for unknown errors
          throw new WidgetManifestLoadError('unknown', 'failed to load config', {
            cause,
          });
        }),
      ),
    );
  }

  /**
   * Internal: queries widget manifest from the API and maps HTTP errors to
   * typed {@link WidgetManifestLoadError} instances.
   *
   * @param widgetKey - Widget identifier.
   * @param args - Optional version or tag selector.
   * @returns Observable emitting the {@link WidgetManifest}.
   */
  protected _getWidget(
    widgetKey: GetWidgetParameters['widgetKey'],
    args?: GetWidgetParameters['args'],
  ): Observable<WidgetManifest> {
    // Create a new query using the configured client
    const client = new Query(this.#config.client.getWidgetManifest);
    this.#subscription.add(() => client.complete());

    // Execute the query and handle errors
    return Query.extractQueryValue(
      client.query({ widgetKey, args }).pipe(
        catchError((err) => {
          // Extract the cause since the error will be a `QueryError`
          const { cause } = err;

          // Handle specific errors and throw a `GetWidgetConfigError` if applicable
          if (cause instanceof WidgetConfigLoadError) {
            throw cause;
          }
          if (cause instanceof HttpResponseError) {
            throw WidgetConfigLoadError.fromHttpResponse(cause.response, { cause });
          }
          // Throw a generic `GetWidgetManifestError` for unknown errors
          throw new WidgetConfigLoadError('unknown', 'failed to load config', {
            cause,
          });
        }),
      ),
    );
  }

  /**
   * Disposes all internal query subscriptions.
   *
   * After disposal the provider should not be reused.
   */
  public dispose() {
    this.#subscription.unsubscribe();
  }
}

export default WidgetModuleProvider;
