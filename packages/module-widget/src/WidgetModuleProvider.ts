import { catchError, Observable, Subscription } from 'rxjs';

import { ModuleType } from '@equinor/fusion-framework-module';
import { HttpResponseError } from '@equinor/fusion-framework-module-http';
import { EventModule } from '@equinor/fusion-framework-module-event';

import { Query } from '@equinor/fusion-query';

import type { GetWidgetArgs, Widget, WidgetManifest } from './types';

import { WidgetModuleConfig } from './WidgetConfigurator';
import { WidgetConfigError, WidgetManifestError } from './errors';

export interface IWidgetModuleProvider {
    getWidget(widgetKey: string, args?: GetWidgetArgs): Observable<Widget>;
    dispose: VoidFunction;
}

export class WidgetModuleProvider implements IWidgetModuleProvider {
    #widgetClient: Query<WidgetManifest, { widgetKey: string }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #configClient: Query<Widget, { widgetKey: string; args?: GetWidgetArgs }>;

    #subscription = new Subscription();

    constructor(args: { config: WidgetModuleConfig; event?: ModuleType<EventModule> }) {
        const { config } = args;

        this.#widgetClient = new Query(config.client.getWidgetManifest);
        this.#configClient = new Query(config.client.getWidget);

        this.#subscription.add(() => this.#widgetClient.complete());
        this.#subscription.add(() => this.#configClient.complete());
    }

    /**
     * @deprecated Not used during runtime
     */
    _getWidgetManifest(widgetKey: string): Observable<WidgetManifest> {
        return Query.extractQueryValue(
            this.#widgetClient.query({ widgetKey }).pipe(
                catchError((err) => {
                    /** extract cause, since error will be a `QueryError` */
                    const { cause } = err;
                    if (cause instanceof WidgetManifestError) {
                        throw cause;
                    }
                    if (cause instanceof HttpResponseError) {
                        throw WidgetManifestError.fromHttpResponse(cause.response, { cause });
                    }
                    throw new WidgetManifestError('unknown', 'failed to load manifest', { cause });
                })
            )
        );
    }

    /**
     * fetch configuration for a widget
     * @param widgetKey - widget key
     * @param version - version of widget to use
     */
    getWidget(widgetKey: string, args?: GetWidgetArgs): Observable<Widget> {
        return Query.extractQueryValue(
            this.#configClient.query({ widgetKey, args }).pipe(
                catchError((err) => {
                    /** extract cause, since error will be a `QueryError` */
                    const { cause } = err;
                    if (cause instanceof WidgetConfigError) {
                        throw cause;
                    }
                    if (cause instanceof HttpResponseError) {
                        throw WidgetConfigError.fromHttpResponse(cause.response, { cause });
                    }
                    throw new WidgetConfigError('unknown', 'failed to load config', { cause });
                })
            )
        );
    }

    public dispose() {
        this.#subscription.unsubscribe();
    }
}

export default WidgetModuleProvider;
