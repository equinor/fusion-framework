import { lastValueFrom, Observable, Subscription, throwError } from 'rxjs';
import { filter, map, pairwise, switchMap } from 'rxjs/operators';

import { ContextModuleConfig } from './configurator';

import { ContextClient } from './client/ContextClient';
import { ContextItem, QueryContextParameters, RelatedContextParameters } from './types';
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
    validateContext(item: ContextItem<Record<string, unknown>>): boolean;
    resolveContext: (current: ContextItem) => Observable<ContextItem>;
    resolveContextAsync: (current: ContextItem) => Promise<ContextItem>;
    relatedContexts: (
        args: RelatedContextParameters
    ) => Observable<Array<ContextItem<Record<string, unknown>>>>;
    relatedContextsAsync: (
        args: RelatedContextParameters
    ) => Promise<Array<ContextItem<Record<string, unknown>>>>;
    clearCurrentContext: VoidFunction;
}

export class ContextProvider implements IContextProvider {
    #contextClient: ContextClient;
    #contextQuery: Query<Array<ContextItem>, QueryContextParameters>;
    #contextRelated?: Query<Array<ContextItem>, RelatedContextParameters>;

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
        context ? this.setCurrentContext(context) : this.clearCurrentContext();
    }

    constructor(args: {
        config: ContextModuleConfig;
        event?: ModuleType<EventModule>;
        parentContext?: IContextProvider;
    }) {
        const { config, event, parentContext } = args;

        config.resolveContext && (this.resolveContext = config.resolveContext?.bind(this));
        config.validateContext && (this.validateContext = config.validateContext?.bind(this));

        this.#contextType = config.contextType;
        this.#contextFilter = config.contextFilter;

        this.#contextClient = new ContextClient(config.client.get);
        this.#contextQuery = new Query(config.client.query);

        if (config.client.related) {
            this.#contextRelated = new Query(config.client.related);
        }

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
                parentContext.contextClient.currentContext$
                    .pipe(
                        switchMap(async (next) => {
                            if (next) {
                                const onParentContextChanged = await this.#event?.dispatchEvent(
                                    'onParentContextChanged',
                                    {
                                        source: this,
                                        detail: next,
                                        cancelable: true,
                                    }
                                );
                                return { next, canceled: onParentContextChanged?.canceled };
                            }
                            return { next };
                        }),
                        filter((x) => !x.canceled),
                        map(({ next }) => next)
                    )
                    .subscribe(async (next) => {
                        if (next) {
                            try {
                                await this.setCurrentContext(next, {
                                    validate: true,
                                    resolve: true,
                                });
                            } catch (err) {
                                console.warn('ContextProvider::onParentContextChanged', err);
                            }
                        } else {
                            this.clearCurrentContext();
                        }
                    })
            );
        }
    }

    public async setCurrentContext(
        context: ContextItem<Record<string, unknown>>,
        opt?: { validate?: boolean; resolve?: boolean }
    ): Promise<ContextItem<Record<string, unknown>>> {
        if (context === this.currentContext) {
            return context;
        }
        if (opt?.validate && !this.validateContext(context)) {
            if (opt.resolve) {
                /** notify listeners about to resolve invalid context */
                const onSetContextResolve = await this.#event?.dispatchEvent(
                    'onSetContextResolve',
                    {
                        source: this,
                        cancelable: true,
                        detail: { context },
                    }
                );
                if (onSetContextResolve?.canceled) {
                    throw Error('resolving of context was canceled');
                }

                try {
                    const resolvedContext = await this.resolveContextAsync(context);
                    /** notify listeners about to resolved invalid context */
                    const onSetContextResolved = await this.#event?.dispatchEvent(
                        'onSetContextResolved',
                        {
                            source: this,
                            cancelable: true,
                            detail: { input: context, result: resolvedContext },
                        }
                    );
                    if (onSetContextResolved?.canceled) {
                        throw Error('resolving of context was canceled');
                    }
                    return this.setCurrentContext(resolvedContext);
                } catch (err) {
                    console.error('failed to resolve context', context, err);
                    this.clearCurrentContext();
                }
            }
            throw Error('failed to validate provided context');
        }

        const onCurrentContextChange = await this.#event?.dispatchEvent('onCurrentContextChange', {
            source: this,
            canBubble: true,
            cancelable: true,
            detail: { context: context },
        });

        if (onCurrentContextChange?.canceled) {
            throw Error('change of context was aborted');
        }

        this.#contextClient.setCurrentContext(context);

        return context;
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

    public validateContext(item: ContextItem<Record<string, unknown>>): boolean {
        if (!this.#contextType) return true;
        return this.#contextType.map((x) => x.toLowerCase()).includes(item.type.id.toLowerCase());
    }

    public resolveContext(
        item: ContextItem<Record<string, unknown>>
    ): Observable<ContextItem<Record<string, unknown>>> {
        return this.relatedContexts({ item, filter: { type: this.#contextType } }).pipe(
            map((x) => x.filter((item) => this.validateContext(item))),
            map((values) => {
                const value = values.shift();
                if (!value) {
                    throw Error('failed to resolve context');
                }
                if (values.length) {
                    console.warn(
                        'ContextProvider::relatedContext',
                        'multiple items found 🤣',
                        values
                    );
                }
                return value;
            })
        );
    }

    public resolveContextAsync(
        item: ContextItem<Record<string, unknown>>
    ): Promise<ContextItem<Record<string, unknown>>> {
        return lastValueFrom(this.resolveContext(item));
    }

    public relatedContexts(
        args: RelatedContextParameters
    ): Observable<Array<ContextItem<Record<string, unknown>>>> {
        if (!this.#contextRelated) {
            return throwError(() =>
                Error(
                    'ContextProvider::relatedContexts - no client defined for resolving related context'
                )
            );
        }
        return this.#contextRelated.query(args).pipe(map(({ value }) => value));
    }

    public relatedContextsAsync(
        args: RelatedContextParameters
    ): Promise<Array<ContextItem<Record<string, unknown>>>> {
        return lastValueFrom(this.relatedContexts(args));
    }

    public clearCurrentContext() {
        this.#contextClient.setCurrentContext(undefined);
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
        onParentContextChanged: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem | undefined;
                },
                IContextProvider
            >
        >;

        onSetContextResolve: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem;
                },
                IContextProvider
            >
        >;
        onSetContextResolved: FrameworkEvent<
            FrameworkEventInit<
                {
                    input: ContextItem;
                    result?: ContextItem | null;
                },
                IContextProvider
            >
        >;
    }
}
