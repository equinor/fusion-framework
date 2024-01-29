import { catchError, Observable, Subscription } from 'rxjs';

import { ModuleType } from '@equinor/fusion-framework-module';
import { HttpResponseError } from '@equinor/fusion-framework-module-http';
import { EventModule } from '@equinor/fusion-framework-module-event';

import { Query } from '@equinor/fusion-query';

import type { GetWidgetParameters, WidgetManifest } from './types';

import { WidgetModuleConfig } from './WidgetModuleConfigurator';
import { GetWidgetError } from './errors';
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
}

export class WidgetModuleProvider implements IWidgetModuleProvider {
    #widgetClient: Query<WidgetManifest, GetWidgetParameters>;
    #subscription = new Subscription();
    #config: WidgetModuleConfig;
    #event?: ModuleType<EventModule>;

    constructor(args: { config: WidgetModuleConfig; event?: ModuleType<EventModule> }) {
        const { config, event } = args;
        this.#event = event;
        this.#config = config;
        this.#widgetClient = new Query(config.client.getWidget);

        this.#subscription.add(() => this.#widgetClient.complete());
    }

    public getWidget(name: string, widgetPrams?: GetWidgetParameters['args']): Widget {
        return new Widget(
            { name },
            { provider: this, event: this.#event, widgetPrams, config: this.#config },
        );
    }

    public getWidgetManifest(
        name: string,
        widgetPrams?: GetWidgetParameters['args'],
    ): Observable<WidgetManifest> {
        return this._getWidget(name, widgetPrams);
    }

    /**
     * fetch configuration for a widget
     * @param widgetKey - widget key
     * @param version - version of widget to use
     */
    protected _getWidget(
        widgetKey: GetWidgetParameters['widgetKey'],
        args?: GetWidgetParameters['args'],
    ): Observable<WidgetManifest> {
        const client = new Query(this.#config.client.getWidget);
        return Query.extractQueryValue(
            client.query({ widgetKey, args }).pipe(
                catchError((err) => {
                    /** extract cause, since error will be a `QueryError` */
                    const { cause } = err;
                    console.log('query', err);
                    if (cause instanceof GetWidgetError) {
                        throw cause;
                    }
                    if (cause instanceof HttpResponseError) {
                        throw GetWidgetError.fromHttpResponse(cause.response, { cause });
                    }
                    throw new GetWidgetError('unknown', 'failed to load config', { cause });
                }),
            ),
        );
    }

    public dispose() {
        this.#subscription.unsubscribe();
    }
}

export default WidgetModuleProvider;
