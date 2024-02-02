import { catchError, Observable, Subscription } from 'rxjs';

import { ModuleType } from '@equinor/fusion-framework-module';
import { HttpResponseError } from '@equinor/fusion-framework-module-http';
import { EventModule } from '@equinor/fusion-framework-module-event';

import { Query } from '@equinor/fusion-query';

import type { GetWidgetParameters, WidgetConfig, WidgetManifest } from './types';

import { WidgetModuleConfig } from './WidgetModuleConfigurator';
import { GetWidgetConfigError, GetWidgetManifestError } from './errors';
import { Widget } from './Widget';

export interface IWidgetModuleProvider {
    getWidget(
        widgetKey: GetWidgetParameters['widgetKey'],
        args?: GetWidgetParameters['args'],
    ): Widget;
    getWidgetManifest(
        widgetKey: GetWidgetParameters['widgetKey'],
        args?: GetWidgetParameters['args'],
    ): Observable<WidgetManifest>;
    getWidgetConfig(
        widgetKey: GetWidgetParameters['widgetKey'],
        args?: GetWidgetParameters['args'],
    ): Observable<WidgetConfig>;
}

/**
 * The `WidgetModuleProvider` class implements the `IWidgetModuleProvider` interface and serves as a provider for managing widgets.
 */
export class WidgetModuleProvider implements IWidgetModuleProvider {
    // Private fields
    #subscription = new Subscription();
    #config: WidgetModuleConfig;
    #event?: ModuleType<EventModule>;

    /**
     * Constructs a new `WidgetModuleProvider` instance.
     * @param args - An object containing configuration and optional event module for the widget provider.
     */
    constructor(args: { config: WidgetModuleConfig; event?: ModuleType<EventModule> }) {
        const { config, event } = args;
        this.#event = event;
        this.#config = config;
    }

    /**
     * Retrieves a widget instance based on the provided name and optional parameters.
     * @param name - The name of the widget.
     * @param widgetParams - Optional parameters for the widget.
     * @returns A new `Widget` instance.
     */
    public getWidget(name: string, widgetPrams?: GetWidgetParameters['args']): Widget {
        return new Widget(
            { name },
            { provider: this, event: this.#event, widgetPrams, config: this.#config },
        );
    }

    /**
     * Retrieves the manifest of a widget as an observable stream.
     * @param name - The name of the widget.
     * @param widgetParams - Optional parameters for the widget.
     * @returns An observable stream of the widget manifest.
     */
    public getWidgetManifest(
        name: string,
        widgetPrams?: GetWidgetParameters['args'],
    ): Observable<WidgetManifest> {
        return this._getWidget(name, widgetPrams);
    }

    /**
     * Retrieves the config of a widget as an observable stream.
     * @param name - The name of the widget.
     * @param widgetParams - Optional parameters for the widget.
     * @returns An observable stream of the widget config.
     */
    public getWidgetConfig(
        name: string,
        widgetPrams?: GetWidgetParameters['args'],
    ): Observable<WidgetConfig> {
        return this._getWidgetConfig(name, widgetPrams);
    }

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
                    console.error('query', err);
                    // Handle specific errors and throw a `GetWidgetManifestError` if applicable
                    if (cause instanceof GetWidgetManifestError) {
                        throw cause;
                    }
                    if (cause instanceof HttpResponseError) {
                        throw GetWidgetManifestError.fromHttpResponse(cause.response, { cause });
                    }
                    // Throw a generic `GetWidgetManifestError` for unknown errors
                    throw new GetWidgetManifestError('unknown', 'failed to load config', { cause });
                }),
            ),
        );
    }

    /**
     * Fetches the configuration for a widget using a query.
     * @param widgetKey - The key identifying the widget.
     * @param args - Optional arguments for the widget.
     * @returns An observable stream of the widget manifest.
     * @protected
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
                    console.error('query', err);
                    // Handle specific errors and throw a `GetWidgetConfigError` if applicable
                    if (cause instanceof GetWidgetConfigError) {
                        throw cause;
                    }
                    if (cause instanceof HttpResponseError) {
                        throw GetWidgetConfigError.fromHttpResponse(cause.response, { cause });
                    }
                    // Throw a generic `GetWidgetManifestError` for unknown errors
                    throw new GetWidgetConfigError('unknown', 'failed to load config', { cause });
                }),
            ),
        );
    }

    /**
     * Disposes of the widget provider by unsubscribing from any active subscriptions.
     */
    public dispose() {
        this.#subscription.unsubscribe();
    }
}

export default WidgetModuleProvider;
