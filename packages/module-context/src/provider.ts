import { IContextModuleConfig } from './configurator';

import { ContextClient } from './client/ContextClient';
import { ContextItem, QueryContextParameters } from './types';
import { ModuleType } from '@equinor/fusion-framework-module';
import {
    EventModule,
    FrameworkEvent,
    FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';
import Query from '@equinor/fusion-observable/query';

/**
 * WARNING: this is an initial out cast.
 * api clients will most probably not be exposed in future!
 */
export interface IContextProvider {
    /** DANGER */
    readonly contextClient: ContextClient;
    /** DANGER */
    readonly queryClient: Query<ContextItem[], QueryContextParameters>;
}

export class ContextProvider implements IContextProvider {
    #contextClient: ContextClient;
    #contextQuery: Query<ContextItem[], QueryContextParameters>;

    public get contextClient() {
        return this.#contextClient;
    }

    public get queryClient() {
        return this.#contextQuery;
    }

    get currentContext(): ContextItem | undefined {
        return this.#contextClient.currentContext;
    }

    set currentContext(context: ContextItem | undefined) {
        this.#contextClient.setCurrentContext(context);
    }

    constructor(args: { config: IContextModuleConfig; event?: ModuleType<EventModule> }) {
        const { config, event } = args;
        this.#contextClient = new ContextClient(config.getContext);

        this.#contextQuery = new Query(config.queryContext);

        if (event) {
            /** this might be moved to client, to await prevention of event */
            this.#contextClient.currentContext$.subscribe((context) => {
                event.dispatchEvent('onCurrentContextChange', {
                    canBubble: true,
                    detail: { context },
                });
            });
        }
    }
}

export default ContextProvider;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onCurrentContextChange: FrameworkEvent<
            FrameworkEventInit<{
                context: ContextItem | undefined;
            }>
        >;
    }
}
