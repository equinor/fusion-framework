import { catchError, Observable, Subscription } from 'rxjs';

import { ModuleType } from '@equinor/fusion-framework-module';
import { HttpResponseError } from '@equinor/fusion-framework-module-http';
import { EventModule } from '@equinor/fusion-framework-module-event';

import { Query } from '@equinor/fusion-query';

import type { GetWidgetParameters, WidgetManifest } from './types';

import { WidgetModuleConfig } from './WidgetModuleConfigurator';
import { GetWidgetError } from './errors';

export interface IWidgetModuleProvider {
    getWidget(
        widgetKey: GetWidgetParameters['widgetKey'],
        args: GetWidgetParameters['args']
    ): Observable<WidgetManifest>;
}

export class WidgetModuleProvider implements IWidgetModuleProvider {
    #widgetClient: Query<WidgetManifest, GetWidgetParameters>;
    #subscription = new Subscription();

    constructor(args: { config: WidgetModuleConfig; event?: ModuleType<EventModule> }) {
        const { config } = args;

        this.#widgetClient = new Query(config.client.getWidget);

        this.#subscription.add(() => this.#widgetClient.complete());
    }

    public getWidget(name: string): Observable<WidgetManifest> {
        return this._getWidget(name);
    }

    public getWidgetByVersion(name: string, version: string): Observable<WidgetManifest> {
        return this._getWidget(name, { type: 'version', value: version });
    }

    public getWidgetByTag(name: string, tag: string): Observable<WidgetManifest> {
        return this._getWidget(name, { type: 'tag', value: tag });
    }

    /**
     * fetch configuration for a widget
     * @param widgetKey - widget key
     * @param version - version of widget to use
     */
    protected _getWidget(
        widgetKey: GetWidgetParameters['widgetKey'],
        args?: GetWidgetParameters['args']
    ): Observable<WidgetManifest> {
        return Query.extractQueryValue(
            this.#widgetClient.query({ widgetKey, args }).pipe(
                catchError((err) => {
                    /** extract cause, since error will be a `QueryError` */
                    const { cause } = err;
                    if (cause instanceof GetWidgetError) {
                        throw cause;
                    }
                    if (cause instanceof HttpResponseError) {
                        throw GetWidgetError.fromHttpResponse(cause.response, { cause });
                    }
                    throw new GetWidgetError('unknown', 'failed to load config', { cause });
                })
            )
        );
    }

    public dispose() {
        this.#subscription.unsubscribe();
    }
}

export default WidgetModuleProvider;
