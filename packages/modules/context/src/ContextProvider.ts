import { EMPTY, lastValueFrom, Observable, of, Subject, Subscription, throwError } from 'rxjs';
import {
    catchError,
    filter,
    finalize,
    map,
    pairwise,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs/operators';

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
/**
 * Represents a context provider that manages the current context and provides methods for querying and manipulating context items.
 */
export interface IContextProvider {
    /** DANGER */
    readonly contextClient: ContextClient;
    /** DANGER */
    readonly queryClient: Query<ContextItem[], QueryContextParameters>;

    // stream of current context
    readonly currentContext$: Observable<ContextItem | null | undefined>;

    // current context of the current state
    currentContext: ContextItem | null | undefined;

    /**
     * Queries the context items based on the provided search string.
     * @param search The search string.
     * @returns An observable that emits an array of context items.
     */
    queryContext(search: string): Observable<Array<ContextItem>>;

    /**
     * Queries the context items asynchronously based on the provided search string.
     * @param search The search string.
     * @returns A promise that resolves to an array of context items.
     */
    queryContextAsync(search: string): Promise<Array<ContextItem>>;

    /**
     * Validates the given context item.
     * @param item The context item to validate.
     * @returns A boolean indicating whether the context item is valid or not.
     */
    validateContext(item: ContextItem<Record<string, unknown>>): boolean;

    /**
     * Resolves the context item as a stream.
     * @param current The current context item.
     * @returns An observable that emits the resolved context item.
     */
    resolveContext: (current: ContextItem) => Observable<ContextItem>;

    /**
     * Resolves the context item asynchronously.
     * @param current The current context item.
     * @returns A promise that resolves to the resolved context item.
     */
    resolveContextAsync: (current: ContextItem) => Promise<ContextItem>;

    /**
     * Retrieves the related context items based on the provided parameters.
     * @param args The parameters for retrieving related context items.
     * @returns An observable that emits an array of related context items.
     */
    relatedContexts: (
        args: RelatedContextParameters,
    ) => Observable<Array<ContextItem<Record<string, unknown>>>>;

    /**
     * Retrieves the related context items asynchronously based on the provided parameters.
     * @param args The parameters for retrieving related context items.
     * @returns A promise that resolves to an array of related context items.
     */
    relatedContextsAsync: (
        args: RelatedContextParameters,
    ) => Promise<Array<ContextItem<Record<string, unknown>>>>;

    /**
     * Clears the current context.
     */
    clearCurrentContext: VoidFunction;

    /**
     * Sets the current context item by its ID.
     * @param id The ID of the context item.
     * @returns An observable that emits the current context item.
     */
    setCurrentContextById(id: string): Observable<ContextItem<Record<string, unknown>>>;

    /**
     * Sets the current context item by its ID asynchronously.
     * @param id The ID of the context item.
     * @returns A promise that resolves to the current context item.
     */
    setCurrentContextByIdAsync(id: string): Promise<ContextItem<Record<string, unknown>>>;

    /**
     * Sets the current context item.
     * @param context The context item to set as the current context.
     * @param opt Optional settings for the operation.
     * @param opt.validate Specifies whether to validate the context item. Default is `true`.
     * @param opt.resolve Specifies whether to resolve the context item. Default is `true`.
     * @returns An observable that emits the current context item or `null`.
     */
    setCurrentContext(
        context: ContextItem<Record<string, unknown>> | null,
        opt?: { validate?: boolean; resolve?: boolean },
    ): Observable<ContextItem<Record<string, unknown>> | null>;

    /**
     * Sets the current context item asynchronously.
     * @param context The context item to set as the current context.
     * @param opt Optional settings for the operation.
     * @param opt.validate Specifies whether to validate the context item. Default is `true`.
     * @param opt.resolve Specifies whether to resolve the context item. Default is `true`.
     * @returns A promise that resolves to the current context item or `null`.
     */
    setCurrentContextAsync(
        context: ContextItem<Record<string, unknown>> | null,
        opt?: { validate?: boolean; resolve?: boolean },
    ): Promise<ContextItem<Record<string, unknown>> | null>;
}

export class ContextProvider implements IContextProvider {
    #contextClient: ContextClient;
    #contextQuery: Query<Array<ContextItem>, QueryContextParameters>;
    #contextRelated?: Query<Array<ContextItem>, RelatedContextParameters>;

    #event?: ModuleType<EventModule>;

    #subscriptions = new Subscription();

    #contextType?: ContextModuleConfig['contextType'];
    #contextFilter: ContextModuleConfig['contextFilter'];
    #contextParameterFn: Required<ContextModuleConfig>['contextParameterFn'];

    #contextQueue = new Subject<Observable<ContextItem<Record<string, unknown>>>>();

    public get contextClient() {
        return this.#contextClient;
    }

    public get queryClient() {
        return this.#contextQuery;
    }

    get currentContext$(): Observable<ContextItem | null | undefined> {
        return this.#contextClient.currentContext$;
    }

    get currentContext(): ContextItem | undefined | null {
        return this.#contextClient.currentContext;
    }

    /** @deprecated do not use, will be removed */
    set currentContext(context: ContextItem | null | undefined) {
        console.warn(
            '@deprecated',
            'ContextProvider.currentContext',
            'use setCurrentContextById|setCurrentContext|clearCurrentContext',
        );
        if (context === undefined) {
            throw Error('not allowed to set current context as undefined undefined!');
        }
        this.setCurrentContextAsync(context);
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
                'parentContext as arg is deprecated, use ContextProvider.connectParentContext',
            );
        }

        this.#event = event;

        // set the resolve and validate context functions
        config.resolveContext && (this.resolveContext = config.resolveContext?.bind(this));
        config.validateContext && (this.validateContext = config.validateContext?.bind(this));

        this.#contextType = config.contextType;
        this.#contextFilter = config.contextFilter;

        // create clients
        this.#contextClient = new ContextClient(config.client.get);
        this.#contextQuery = new Query(config.client.query);

        if (config.client.related) {
            this.#contextRelated = new Query(config.client.related);
        }

        // set the context parameter function
        this.#contextParameterFn =
            config.contextParameterFn ??
            // fallback to default
            ((args: Parameters<Required<ContextModuleConfig>['contextParameterFn']>[0]) => ({
                search: args.search,
                filter: { type: args.type },
            }));

        // if event module is available, setup event listeners
        if (this.#event) {
            this.#subscriptions.add(
                // observe current context changes
                this.currentContext$
                    .pipe(
                        // emit previous and next context
                        pairwise(),
                    )
                    .subscribe(([previous, next]) => {
                        this.#event?.dispatchEvent('onCurrentContextChanged', {
                            source: this,
                            canBubble: true,
                            detail: { previous, next },
                        });
                    }),
            );
            this.#subscriptions.add(
                // observe current context changes from child modules
                this.#event.addEventListener('onCurrentContextChanged', (e) => {
                    // prevent infinite loop, only set context if source is not this
                    if (e.source !== this && e.detail.next !== undefined) {
                        this.setCurrentContext(e.detail.next);
                    }
                }),
            );
        }

        // wire up context queue
        this.#subscriptions.add(
            this.#contextQueue
                .pipe(
                    // resolve context item from queue
                    switchMap((next) => next),
                    tap((x) => console.debug('ContextProvider::#contextQueue', x)),
                )
                .subscribe((context) => {
                    // set context from resolved context item from queue
                    this.#contextClient.setCurrentContext(context ?? null);
                }),
        );
    }

    public connectParentContext(
        provider: IContextProvider,
        opt?: { skipFirst: boolean },
    ): Subscription {
        const parentContext$ = provider.currentContext$.pipe(
            // do not set context if parent has not initialized
            filter((x): x is ContextItem | null => x !== undefined),
            filter((next, index) => {
                // skip first item if opt.skipFirst is true
                // TODO: this is a bit hacky, should be handled in a better way
                if (opt?.skipFirst && index <= 1) {
                    console.debug(
                        'ContextProvider::connectParentContext',
                        'skipping first item',
                        next,
                    );
                    return false;
                }
                // only set context if it has changed
                return this.currentContext?.id !== next?.id;
            }),
            switchMap(async (next) => {
                if (!next) {
                    // if parent context is null, just return
                    return { next };
                }
                // notify event observers that parent context is about to change and await for cancelation
                const onParentContextChanged = await this.#event?.dispatchEvent(
                    'onParentContextChanged',
                    {
                        source: this,
                        detail: next,
                        cancelable: true,
                    },
                );
                return { next, canceled: onParentContextChanged?.canceled };
            }),
            // filter out canceled context changes
            filter((x) => !x.canceled),
            switchMap(({ next }) => {
                // set current context with validation and resolution
                return this.setCurrentContext(next, {
                    validate: true,
                    resolve: true,
                }).pipe(
                    catchError((err) => {
                        console.warn(
                            'ContextProvider::onParentContextChanged',
                            'setCurrentContext',
                            err,
                        );
                        // do not emit any value if an error occurs
                        return EMPTY;
                    }),
                );
            }),
            catchError((err) => {
                console.warn('ContextProvider::onParentContextChanged', 'unhandled exception', err);
                // do not emit any value if an error occurs
                return EMPTY;
            }),
        );

        // subscribe to parent context changes
        const subscription = parentContext$.subscribe();

        // add subscription to internal teardown
        this.#subscriptions.add(subscription);
        return subscription;
    }

    public setCurrentContextById(id: string): Observable<ContextItem<Record<string, unknown>>> {
        return new Observable((subscriber) => {
            try {
                this.#contextClient
                    // resolve context item by id
                    .resolveContext(id)
                    .pipe(
                        // filter out invalid context items
                        filter((item): item is ContextItem => !!item),
                        // set current context with validation and resolution
                        switchMap((item) => this.setCurrentContext(item)),
                    )
                    .subscribe(subscriber);
            } catch (err) {
                // catch any unhandled exceptions and emit error
                subscriber.error(err);
            }
        });
    }

    public setCurrentContextByIdAsync(id: string): Promise<ContextItem<Record<string, unknown>>> {
        // return last value from observable
        return lastValueFrom(this.setCurrentContextById(id));
    }

    /**
     * Setting context is a complex operation, and might not happen immediately.
     * When setting the context, a task is created and added to the queue.
     * Once the task is completed, the returned observable will emit the value which will be the next state.
     *
     * Even tho this function returns a `Observable`, the task will be queued even tho nobody subscribes.
     *
     * If the observable is subscribe, unsubscribing __WILL__ abort the task and remove it from queue
     *
     * @param context context item which would be queue to set as current
     */
    public setCurrentContext<T extends ContextItem<Record<string, unknown>> | null>(
        context: T,
        opt?: { validate?: boolean; resolve?: boolean },
    ): Observable<T> {
        // signal for aborting the queue entry
        const abort$ = new Subject();

        // wrapper for returning an observable to the caller
        const subject$ = new Subject<T>();

        const task$ = this._setCurrentContext(context, opt).pipe(
            // send context item which was set to the caller
            tap((x) => subject$.next(x)),
            // abort task on signal
            takeUntil(abort$),
            // close the observable sent to the caller
            finalize(() => subject$.complete()),
            // catch any unhandled exceptions to not stall the queue
            catchError((err) => {
                // emit error to caller
                subject$.error(err);
                // skip setting any context
                return EMPTY;
            }),
        );

        // add task to internal queue
        this.#contextQueue.next(task$ as Observable<ContextItem<Record<string, unknown>>>);

        return subject$.pipe(
            // if caller subscribes, unsubscribe should abort queue entry
            finalize(() => abort$.next(true)),
        );
    }

    protected _setCurrentContext<T extends ContextItem<Record<string, unknown>> | null>(
        context: T,
        opt?: { validate?: boolean; resolve?: boolean },
    ): Observable<T> {
        return new Observable((subscriber) => {
            // if context is the same as current, just emit and complete
            if (context === this.currentContext) {
                subscriber.next(context);
                return subscriber.complete();
            }
            // check if context is provided and should be validated
            if (context && opt?.validate && !this.validateContext(context)) {
                // check if the resolve context is provided
                if (!opt.resolve) {
                    // notify event observers that context validation failed since resolve is not provided
                    this.#event?.dispatchEvent('onSetContextValidationFailed', {
                        source: this,
                        detail: { context },
                    });
                    // emit error and complete
                    return subscriber.error(Error('failed to validate provided context'));
                }
                if (opt.resolve) {
                    return of(context)
                        .pipe(
                            // notify event observers that context is about to get resolved
                            switchMap(async (context) => {
                                // wait for event listeners to handle the event
                                const event = await this.#event?.dispatchEvent(
                                    'onSetContextResolve',
                                    {
                                        source: this,
                                        cancelable: true,
                                        detail: { context },
                                    },
                                );
                                // check if event was canceled and abort if so
                                if (event?.canceled) {
                                    throw Error('resolving of context was canceled');
                                }
                                return context;
                            }),
                            // resolve context
                            switchMap((context) =>
                                this.resolveContext(context).pipe(
                                    map((resolved) => ({
                                        context,
                                        resolved,
                                    })),
                                ),
                            ),
                            // notify event listeners that context was resolved
                            switchMap(async ({ context, resolved }) => {
                                // wait for event listeners to handle the event
                                const event = await this.#event?.dispatchEvent(
                                    'onSetContextResolved',
                                    {
                                        source: this,
                                        cancelable: true,
                                        detail: { context, resolved },
                                    },
                                );
                                // check if event was canceled and abort if so
                                if (event?.canceled) {
                                    throw Error('resolving of context was canceled');
                                }
                                return resolved;
                            }),
                            // recursive call to set current context without validation and resolution
                            switchMap((resolved) =>
                                this._setCurrentContext(resolved as unknown as T),
                            ),
                        )
                        .subscribe(subscriber);
                }
            }

            // make the context an observable
            return of(context)
                .pipe(
                    // alert event listeners that context is about to change
                    switchMap(async (context) => {
                        const event = await this.#event?.dispatchEvent('onCurrentContextChange', {
                            source: this,
                            canBubble: true,
                            cancelable: true,
                            detail: { context: context },
                        });

                        // check if event was canceled and abort if so
                        if (event?.canceled) {
                            throw Error('change of context was aborted');
                        }

                        return context;
                    }),
                )
                .subscribe((context) => {
                    // emit context to the caller
                    subscriber.next(context);
                    // only take the first value and complete
                    subscriber.complete();
                });
        });
    }

    public async setCurrentContextAsync<T extends ContextItem<Record<string, unknown>> | null>(
        context: T,
        opt?: { validate?: boolean; resolve?: boolean },
    ): Promise<T> {
        return lastValueFrom(this.setCurrentContext(context, opt));
    }

    public queryContext(search: string): Observable<Array<ContextItem>> {
        const query$ = this.queryClient
            .query(
                // generate query parameters
                this.#contextParameterFn({
                    search,
                    type: this.#contextType,
                }) as QueryContextParameters,
            )
            .pipe(
                catchError((err) => {
                    // if query client throws a QueryClientError, extract the cause and throw it
                    if (err.name === 'QueryClientError') {
                        throw err.cause;
                    }
                    throw err;
                }),
                map((x) => x.value),
            );

        // apply context filter if available
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
        item: ContextItem<Record<string, unknown>>,
    ): Observable<ContextItem<Record<string, unknown>>> {
        // request related context items for the given context item with the same context type which the provider is configured with
        return this.relatedContexts({ item, filter: { type: this.#contextType } }).pipe(
            // filter out invalid context items
            map((x) => x.filter((item) => this.validateContext(item))),
            map((values) => {
                // related context should be resolved to a single context item
                const value = values.shift();

                // if no value is found, throw an error
                if (!value) {
                    throw Error('failed to resolve context');
                }

                // if multiple items are found, log a warning
                if (values.length) {
                    console.warn(
                        'ContextProvider::relatedContext',
                        'multiple items found 🤣',
                        values,
                    );
                }

                // return the resolved context item
                return value;
            }),
        );
    }

    public resolveContextAsync(
        item: ContextItem<Record<string, unknown>>,
    ): Promise<ContextItem<Record<string, unknown>>> {
        return lastValueFrom(this.resolveContext(item));
    }

    public relatedContexts(
        args: RelatedContextParameters,
    ): Observable<Array<ContextItem<Record<string, unknown>>>> {
        // check if related context client is available
        if (!this.#contextRelated) {
            return throwError(() =>
                Error(
                    'ContextProvider::relatedContexts - no client defined for resolving related context',
                ),
            );
        }

        // request related context items
        return this.#contextRelated.query(args).pipe(
            map(({ value }) => value),
            catchError((err) => {
                if (err.cause) {
                    throw err.cause;
                }
                throw err;
            }),
        );
    }

    public relatedContextsAsync(
        args: RelatedContextParameters,
    ): Promise<Array<ContextItem<Record<string, unknown>>>> {
        return lastValueFrom(this.relatedContexts(args));
    }

    public clearCurrentContext(): void {
        this.setCurrentContext(null);
    }

    dispose() {
        this.#subscriptions.unsubscribe();
        this.#contextClient.dispose();
    }
}

export default ContextProvider;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        // event which is dispatched before the context changes
        onCurrentContextChange: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem | null;
                },
                IContextProvider
            >
        >;
        // event which is dispatched after the context changes
        onCurrentContextChanged: FrameworkEvent<
            FrameworkEventInit<
                {
                    next: ContextItem | null;
                    previous?: ContextItem | null;
                },
                IContextProvider
            >
        >;

        // event which is dispatched before the parent context changes
        onParentContextChanged: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem | null;
                },
                IContextProvider
            >
        >;

        // event which is dispatched before the context will be resolved
        onSetContextResolve: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem;
                },
                IContextProvider
            >
        >;

        // event which is dispatched after the context was resolved
        onSetContextResolved: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem;
                    resolved?: ContextItem | null;
                },
                IContextProvider
            >
        >;

        // event which is dispatched if the context validation failed
        onSetContextValidationFailed: FrameworkEvent<
            FrameworkEventInit<
                {
                    context: ContextItem;
                },
                IContextProvider
            >
        >;

        // event which is dispatched if the context resolve failed
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
