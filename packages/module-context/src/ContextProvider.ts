import { lastValueFrom, Observable, Subscription } from 'rxjs';
import { map, pairwise } from 'rxjs/operators';

import { ContextModuleConfig } from './configurator';

import { ContextClient } from './client/ContextClient';
import { ContextItem, QueryContextParameters } from './types';
import { ModuleType } from '@equinor/fusion-framework-module';
import {
    EventModule,
    FrameworkEvent,
    FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';
import Query from '@equinor/fusion-query';

/**
 * WARNING: this is an initial out cast.
 * api clients will most probably not be exposed in future!
 */
export interface IContextProvider {
    /** DANGER */
    readonly contextClient: ContextClient;
    /** DANGER */
    readonly queryClient: Query<ContextItem[], QueryContextParameters>;

    readonly currentContext$: Observable<ContextItem | undefined>;
    currentContext: ContextItem | undefined;
    queryContext(search: string): Observable<Array<ContextItem>>;
    queryContextAsync(search: string): Promise<Array<ContextItem>>;
    clearCurrentContext: VoidFunction;
}

export class ContextProvider implements IContextProvider {
    #contextClient: ContextClient;
    #contextQuery: Query<Array<ContextItem>, QueryContextParameters>;

    #event?: ModuleType<EventModule>;

    #subscriptions = new Subscription();

    #contextType?: ContextModuleConfig['contextType'];
    #contextFilter: ContextModuleConfig['contextFilter'];
    #contextParameterFn: Required<ContextModuleConfig['contextParameterFn']>;

    public get contextClient() {
        return this.#contextClient;
    }

    public get queryClient() {
        return this.#contextQuery;
    }

    get currentContext$(): Observable<ContextItem | undefined> {
        return this.#contextClient.currentContext$;
    }

    get currentContext(): ContextItem | undefined {
        return this.#contextClient.currentContext;
    }

    set currentContext(context: ContextItem | undefined) {
        if (this.#event) {
            /** notify listeners that context is about to change */
            this.#event
                .dispatchEvent('onCurrentContextChange', {
                    source: this,
                    canBubble: true,
                    cancelable: true,
                    detail: { context },
                })
                .then((e) => {
                    /** check if setting context was prevented by listener */
                    if (!e.canceled) {
                        this.#contextClient.setCurrentContext(context);
                    }
                });
        } else {
            this.#contextClient.setCurrentContext(context);
        }
    }

    constructor(args: {
        config: ContextModuleConfig;
        event?: ModuleType<EventModule>;
        parentContext?: IContextProvider;
    }) {
        const { config, event, parentContext } = args;

        this.#contextType = config.contextType;
        this.#contextFilter = config.contextFilter;

        this.#contextClient = new ContextClient(config.client.get);
        this.#contextQuery = new Query(config.client.query);
        this.#contextParameterFn =
            config.contextParameterFn ??
            ((args: Parameters<Required<ContextModuleConfig>['contextParameterFn']>[0]) => ({
                search: args.search,
                filter: { type: args.type },
            }));

        if (event) {
            this.#event = event;

            /** this might be moved to client, to await prevention of event */
            this.#subscriptions.add(
                this.#contextClient.currentContext$
                    .pipe(pairwise())
                    .subscribe(([previous, next]) => {
                        event.dispatchEvent('onCurrentContextChanged', {
                            source: this,
                            canBubble: true,
                            detail: { previous, next },
                        });
                    })
            );

            this.#subscriptions.add(
                /** observe event from child modules */
                event.addEventListener('onCurrentContextChanged', (e) => {
                    /** loop prevention */
                    if (e.source !== this) {
                        this.currentContext = e.detail.next;
                    }
                })
            );
        }

        if (parentContext) {
            this.#subscriptions.add(
                parentContext.contextClient.currentContext$.subscribe(
                    (next) => (this.currentContext = next)
                )
            );
        }
    }

    public queryContext(search: string): Observable<Array<ContextItem>> {
        const query$ = this.queryClient
            .query(
                // TODO
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-ignore */
                this.#contextParameterFn({ search, type: this.#contextType })
            )
            .pipe(map((x) => x.value));

        return this.#contextFilter ? query$.pipe(map(this.#contextFilter)) : query$;
    }

    public queryContextAsync(search: string): Promise<Array<ContextItem>> {
        return lastValueFrom(this.queryContext(search));
    }

    public clearCurrentContext() {
        this.currentContext = undefined;
    }

    dispose() {
        this.#subscriptions.unsubscribe();
    }
}

export default ContextProvider;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        /** dispatch before context changes */
        onCurrentContextChange: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem | undefined;
                },
                IContextProvider
            >
        >;
        /** dispatch after context changed */
        onCurrentContextChanged: FrameworkEvent<
            FrameworkEventInit<
                {
                    next: ContextItem | undefined;
                    previous: ContextItem | undefined;
                },
                IContextProvider
            >
        >;
    }
}
