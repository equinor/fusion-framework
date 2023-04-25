import {
    EMPTY,
    firstValueFrom,
    lastValueFrom,
    Observable,
    of,
    Subscription,
    throwError,
} from 'rxjs';
import { catchError, filter, map, pairwise, switchMap } from 'rxjs/operators';

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

    setCurrentContextById(id: string): Observable<ContextItem<Record<string, unknown>>>;
    setCurrentContextByIdAsync(id: string): Promise<ContextItem<Record<string, unknown>>>;

    setCurrentContext(
        context: ContextItem<Record<string, unknown>>,
        opt?: { validate?: boolean; resolve?: boolean }
    ): Observable<ContextItem<Record<string, unknown>>>;

    setCurrentContextAsync(
        context: ContextItem<Record<string, unknown>>,
        opt?: { validate?: boolean; resolve?: boolean }
    ): Promise<ContextItem<Record<string, unknown>>>;
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

    /** @deprecated do not use, will be removed */
    set currentContext(context: ContextItem | undefined) {
        console.warn(
            '@deprecated',
            'ContextProvider.currentContext',
            'use setCurrentContextById|setCurrentContext|clearCurrentContext'
        );
        context ? this.setCurrentContextAsync(context) : this.clearCurrentContext();
    }

    constructor(args: {
        config: ContextModuleConfig;
        event?: ModuleType<EventModule>;
        /** @deprecated use  ContextProvider.connectParentContext */
        parentContext?: IContextProvider;
    }) {
        const { config, event } = args;

        if (args.parentContext) {
            console.warn(
                '@deprecated',
                'parentContext as arg is deprecated, use ContextProvider.connectParentContext'
            );
        }

        this.#event = event;

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

        if (this.#event) {
            this.#subscriptions.add(
                this.#contextClient.currentContext$
                    .pipe(pairwise())
                    .subscribe(([previous, next]) => {
                        this.#event?.dispatchEvent('onCurrentContextChanged', {
                            source: this,
                            canBubble: true,
                            detail: { previous, next },
                        });
                    })
            );
            this.#subscriptions.add(
                /** observe event from child modules */
                this.#event.addEventListener('onCurrentContextChanged', (e) => {
                    /** loop prevention */
                    if (e.source !== this) {
                        this.currentContext = e.detail.next;
                    }
                })
            );
        }
    }

    public async connectParentContextAsync(
        provider: IContextProvider,
        opt?: { setCurrent?: boolean }
    ): Promise<Subscription> {
        const parentContext$ = provider.currentContext$.pipe(
            filter((next) => this.currentContext !== next),
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
            switchMap(({ next }) => {
                if (!next) {
                    this.clearCurrentContext();
                    return EMPTY;
                }
                return this.setCurrentContext(next, {
                    validate: true,
                    resolve: true,
                }).pipe(
                    catchError((err) => {
                        console.warn(
                            'ContextProvider::onParentContextChanged',
                            'setCurrentContext',
                            err
                        );
                        return EMPTY;
                    })
                );
            }),
            catchError((err) => {
                console.warn('ContextProvider::onParentContextChanged', 'unhandled exception', err);
                return EMPTY;
            })
        );

        const subscription = parentContext$.subscribe();
        this.#subscriptions.add(subscription);

        return new Promise((resolve, reject) => {
            if (opt?.setCurrent && provider.currentContext) {
                subscription.add(reject);
                subscription.add(
                    this.setCurrentContext(provider.currentContext, {
                        validate: true,
                        resolve: true,
                    }).subscribe({
                        error: (err) => {
                            subscription.remove(reject);
                            reject(err);
                        },
                        complete: () => {
                            subscription.remove(reject);
                            resolve(subscription);
                        },
                    })
                );
            } else {
                return resolve(subscription);
            }
        });
    }

    public setCurrentContextById(id: string): Observable<ContextItem<Record<string, unknown>>> {
        return new Observable((subscriber) => {
            try {
                this.#contextClient
                    .resolveContext(id)
                    .pipe(switchMap((item) => this.setCurrentContext(item)))
                    .subscribe(subscriber);
            } catch (err) {
                subscriber.error(err);
            }
        });
    }

    public setCurrentContextByIdAsync(id: string): Promise<ContextItem<Record<string, unknown>>> {
        return firstValueFrom(this.setCurrentContextById(id));
    }

    public setCurrentContext(
        context: ContextItem<Record<string, unknown>>,
        opt?: { validate?: boolean; resolve?: boolean }
    ): Observable<ContextItem<Record<string, unknown>>> {
        return new Observable((subscriber) => {
            if (context === this.currentContext) {
                subscriber.next(context);
                return subscriber.complete();
            }
            if (opt?.validate && !this.validateContext(context)) {
                if (!opt.resolve) {
                    /** cannot resolve context, and provided is invalid  */
                    this.#event?.dispatchEvent('onSetContextValidationFailed', {
                        source: this,
                        detail: { context },
                    });
                    return subscriber.error(Error('failed to validate provided context'));
                }
                if (opt.resolve) {
                    return of(context)
                        .pipe(
                            /** notify event observers that context is about to get resolved */
                            switchMap(async (context) => {
                                const event = await this.#event?.dispatchEvent(
                                    'onSetContextResolve',
                                    {
                                        source: this,
                                        cancelable: true,
                                        detail: { context },
                                    }
                                );
                                if (event?.canceled) {
                                    throw Error('resolving of context was canceled');
                                }
                                return context;
                            }),
                            /** execute resolve */
                            switchMap((context) =>
                                this.resolveContext(context).pipe(
                                    map((resolved) => ({
                                        context,
                                        resolved,
                                    }))
                                )
                            ),
                            /** notify event observers that context was resolved */
                            switchMap(async ({ context, resolved }) => {
                                const event = await this.#event?.dispatchEvent(
                                    'onSetContextResolved',
                                    {
                                        source: this,
                                        cancelable: true,
                                        detail: { context, resolved },
                                    }
                                );
                                if (event?.canceled) {
                                    throw Error('resolving of context was canceled');
                                }
                                return resolved;
                            }),
                            /** recursive set current context without validation and resolve */
                            switchMap((resolved) => this.setCurrentContext(resolved))
                        )
                        .subscribe(subscriber);
                }
            }

            return of(context)
                .pipe(
                    switchMap(async (context) => {
                        const event = await this.#event?.dispatchEvent('onCurrentContextChange', {
                            source: this,
                            canBubble: true,
                            cancelable: true,
                            detail: { context: context },
                        });

                        if (event?.canceled) {
                            throw Error('change of context was aborted');
                        }

                        return context;
                    })
                )
                .subscribe((context) => {
                    this.#contextClient.setCurrentContext(context);
                    subscriber.next(context);
                    subscriber.complete();
                });
        });
    }

    public async setCurrentContextAsync(
        context: ContextItem<Record<string, unknown>>,
        opt?: { validate?: boolean; resolve?: boolean }
    ): Promise<ContextItem<Record<string, unknown>>> {
        return firstValueFrom(this.setCurrentContext(context, opt));
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
        this.#contextClient.dispose();
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
                    context: ContextItem;
                    resolved?: ContextItem | null;
                },
                IContextProvider
            >
        >;
        onSetContextValidationFailed: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem;
                },
                IContextProvider
            >
        >;
        onSetContextResolveFailed: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem;
                    error: unknown;
                },
                IContextProvider
            >
        >;
    }
}
