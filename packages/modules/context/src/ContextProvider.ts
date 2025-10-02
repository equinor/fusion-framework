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

import type { ContextModuleConfig } from './configurator';

import { ContextClient } from './client/ContextClient';
import type { ContextItem, QueryContextParameters, RelatedContextParameters } from './types';
import type { ModuleType } from '@equinor/fusion-framework-module';
import type {
  EventModule,
  FrameworkEvent,
  FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';
import Query from '@equinor/fusion-query';

/**
 * Interface representing a provider for managing and interacting with context items within an application.
 *
 * The `IContextProvider` interface defines a contract for querying, validating, resolving, and managing the current context state.
 * It supports both synchronous and asynchronous operations, as well as observable streams for reactive programming.
 * This interface is intended to be implemented by modules that encapsulate context-related logic, such as user, tenant, or environment context.
 *
 * ## Core Responsibilities
 * - **Querying Contexts:** Search and retrieve context items based on search criteria, both as observables and promises.
 * - **Current Context Management:** Get, set, and clear the current context, with support for validation and resolution.
 * - **Context Resolution:** Resolve context items to their full representation, synchronously or asynchronously.
 * - **Related Contexts:** Retrieve related context items based on specific parameters.
 * - **Path Utilities:** Extract context IDs from paths and generate paths from context items, supporting deep linking and routing.
 * - **Reactive State:** Expose the current context as an observable stream for reactive UI updates.
 *
 * ## Usage Example
 * ```ts
 * const provider: IContextProvider = ...;
 * provider.currentContext$.subscribe(ctx => {
 *   // React to context changes
 * });
 * const items = await provider.queryContextAsync('search-term');
 * ```
 *
 * ## Notes
 * - Some members are marked as **DANGER** and are intended for advanced or internal use only.
 * - Implementations should ensure thread safety and consistency of the current context state.
 * - Optional methods for path extraction and generation enable integration with routing systems.
 *
 * @template T - The shape of the context item data.
 */
export interface IContextProvider {
  /** DANGER */
  readonly contextClient: ContextClient;
  /** DANGER */
  readonly queryClient: Query<ContextItem[], QueryContextParameters>;

  /**
   * Observable stream emitting the current context item.
   *
   * - Emits `undefined` if the context has not been initialized.
   * - Emits `null` when the current context is cleared.
   * - Emits a `ContextItem` when a valid context is set.
   *
   * @example
   * ```ts
   * portal.context.currentContext$.subscribe(context => {
   *   if (context) {
   *     console.log('Current context:', context);
   *   } else if (context === null) {
   *     console.log('Current context cleared');
   *   }
   * });
   * ```
   */
  readonly currentContext$: Observable<ContextItem | null | undefined>;

  /**
   * Snapshot of the current context item.
   *
   * @remarks
   * This property provides the current context item as a snapshot.
   * It may be `null` or `undefined` if no context is set or if the context is not initialized.
   * It is intended for synchronous access to the current context state.
   *
   * __Use {@link currentContext$} instead of this property to get the current context as an observable stream.__
   */
  readonly currentContext: ContextItem | null | undefined;

  /**
   * Queries the context items based on the provided search string.
   *
   * @example
   * ```ts
   * portal.context.queryContext('search-term').subscribe(contextItems => {
   *   console.log('Queried context items:', contextItems);
   * });
   * ```
   *
   * @param search The search string.
   * @returns An observable that emits an array of context items.
   */
  queryContext(search: string): Observable<Array<ContextItem>>;

  /**
   * Queries the context items asynchronously based on the provided search string.
   *
   * @example
   * ```ts
   * portal.context.queryContextAsync('search-term').then(contextItems => {
   *   console.log('Queried context items:', contextItems);
   * });
   * ```
   *
   * @param search The search string.
   * @returns A promise that resolves to an array of context items.
   */
  queryContextAsync(search: string): Promise<Array<ContextItem>>;

  /**
   * Validates the given context item.
   * This method is used to check if the context item meets the criteria defined in the provider's configuration.
   *
   * @example
   * ```ts
   * const currentContext = portal.context.currentContext;
   * if(app.context.validateContext(currentContext)) {
   *   // the application can safely use the context item
   * } else {
   *   // the context item is not valid, handle accordingly
   * }
   * ```
   *
   * @remarks
   * This method will use the configured validation function to check if the context item is valid.
   *
   * @param item The context item to validate.
   * @returns A boolean indicating whether the context item is valid or not.
   */
  validateContext(item: ContextItem<Record<string, unknown>>): boolean;

  /**
   * Resolves the context item as a stream.
   *
   * This method will try to resolve the context item based on the current context.
   * This is useful when transferring context items between different parts of the application.
   *
   * @remarks
   * A normal implementation of this method will first validate the context item and if it is not valid,
   * it will use the {@link relatedContexts} method to find related context items.
   *
   * @example
   *  ```ts
   * app.context.resolveContext(portal.context.currentContext).subscribe({
   *   next: (resolvedContext) => {
   *     // the application can safely use the resolved context item
   *   },
   *   error: (err) => {
   *      // handle error during context resolution
   *    },
   *    complete: () => {
   *      // context resolution completed
   *    }
   * });
   * ```
   *
   * @param current The current context item.
   * @returns An observable that emits the resolved context item.
   */
  resolveContext: (current: ContextItem) => Observable<ContextItem>;

  /**
   * Resolves the context item asynchronously.
   *
   * @see {@link resolveContext} for more details.
   *
   * @param current The current context item.
   * @returns A promise that resolves to the resolved context item.
   */
  resolveContextAsync: (current: ContextItem) => Promise<ContextItem>;

  /**
   * Retrieves the related context items based on the provided parameters.
   *
   * @param args The parameters for retrieving related context items.
   * @returns An observable that emits an array of related context items.
   */
  relatedContexts: (
    args: RelatedContextParameters,
  ) => Observable<Array<ContextItem<Record<string, unknown>>>>;

  /**
   * Retrieves the related context items asynchronously based on the provided parameters.
   *
   * @see {@link relatedContexts}
   *
   * @param args The parameters for retrieving related context items.
   * @returns A promise that resolves to an array of related context items.
   */
  relatedContextsAsync: (
    args: RelatedContextParameters,
  ) => Promise<Array<ContextItem<Record<string, unknown>>>>;

  /**
   * Clears the current context.
   * This method will set the current context to `null`.
   */
  clearCurrentContext: VoidFunction;

  /**
   * Sets the current context item by its ID.
   *
   * @param id The ID of the context item.
   * @returns An observable that emits the current context item.
   */
  setCurrentContextById(id: string): Observable<ContextItem<Record<string, unknown>>>;

  /**
   * Sets the current context item by its ID asynchronously.
   *
   * @see {@link setCurrentContextById}
   *
   * @param id The ID of the context item.
   * @returns A promise that resolves to the current context item.
   */
  setCurrentContextByIdAsync(id: string): Promise<ContextItem<Record<string, unknown>>>;

  /**
   * Sets the current context item.
   *
   * Optionally validates and resolves the context item based on the provided settings.
   *
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
   *
   * @see {@link setCurrentContext}
   *
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

  /**
   * Method for extracting context id from a path.
   *
   * @remarks
   * This method extracts the context ID from a given path using the extraction method
   * provided to the provider via the configuration. If no extraction method is configured,
   * it returns undefined.
   *
   * @param path path to resolve context from
   * @returns the resolved context item id
   *
   * @example
   * ```ts
   * // configured with extracting id from path like '/context/:id'
   * provider.extractContextIdFromPath('/context/1234'); // returns '1234'
   * ```
   */
  extractContextIdFromPath?: (path: string) => string | undefined;

  /**
   * Method for generating path from a context item.
   *
   * @remarks
   * This method generates a path for the context item using the generation method
   * provided to the provider via the configuration. If no generation method is configured,
   * it returns undefined.
   *
   * @param context context item to generate path from
   * @param path current path
   * @returns path for the context item
   */
  generatePathFromContext?: (context: ContextItem, path: string) => string | undefined;
}

/**
 * Provides context management functionality, including querying, setting, validating, and resolving context items.
 *
 * The `ContextProvider` class acts as a central service for handling context state, supporting asynchronous operations,
 * event-driven updates, and integration with parent/child context providers. It manages a queue for context changes,
 * supports validation and resolution logic, and can interact with related context items.
 *
 * Key Features:
 * - Maintains the current context and exposes it as both an observable and a property.
 * - Allows querying for context items based on search criteria and filters.
 * - Supports setting the current context by ID or by context item, with optional validation and resolution.
 * - Handles context changes asynchronously, queuing tasks and supporting cancellation.
 * - Integrates with an event module to dispatch and listen for context-related events.
 * - Supports connecting to a parent context provider to synchronize context state.
 * - Provides methods for resolving related contexts and validating context items.
 * - Manages subscriptions and ensures proper resource cleanup via `dispose`.
 *
 * @template T The type of context item managed by the provider.
 *
 * @remarks
 * - Some methods and properties are marked as deprecated and may be removed in future versions.
 * - Event integration is optional and depends on the presence of an event module.
 * - The provider is designed to be extensible and can be configured via the `ContextModuleConfig`.
 *
 * @example
 * ```typescript
 * const provider = new ContextProvider({ config: myConfig, event: myEventModule });
 * provider.setCurrentContextById('context-id').subscribe(...);
 * ```
 */
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
    if (config.resolveContext) {
      this.resolveContext = config.resolveContext?.bind(this);
    }
    if (config.validateContext) {
      this.validateContext = config.validateContext?.bind(this);
    }

    if (config.extractContextIdFromPath) {
      // @ts-ignore
      this.extractContextIdFromPath = config.extractContextIdFromPath;
    }
    if (config.generatePathFromContext) {
      // @ts-ignore
      this.generatePathFromContext = config.generatePathFromContext;
    }

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

  /**
   * Connects this context provider to a parent context provider, subscribing to changes in the parent's context.
   *
   * When the parent context changes, this method will:
   * - Optionally skip the first emitted value from the parent (if `opt.skipFirst` is true).
   * - Only update the current context if the context ID has changed.
   * - Dispatch an `onParentContextChanged` event before updating, allowing for cancellation.
   * - Set the current context with validation and resolution, handling errors gracefully.
   *
   * The subscription is automatically managed and will be cleaned up with the provider.
   *
   * @param provider - The parent context provider to connect to.
   * @param opt - Optional settings.
   * @param opt.skipFirst - If true, skips the first emitted value from the parent context.
   * @returns A `Subscription` object representing the connection to the parent context.
   */
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
          console.debug('ContextProvider::connectParentContext', 'skipping first item', next);
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
        const onParentContextChanged = await this.#event?.dispatchEvent('onParentContextChanged', {
          source: this,
          detail: next,
          cancelable: true,
        });
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
            console.warn('ContextProvider::onParentContextChanged', 'setCurrentContext', err);
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

  /**
   * Sets the current context by resolving a context item using the provided ID.
   *
   * This method attempts to resolve a context item by its unique identifier,
   * filters out any invalid or undefined items, and then sets the current context
   * using the resolved item. The operation is performed as an Observable stream,
   * allowing subscribers to react to the context change or handle errors.
   *
   * @param id - The unique identifier of the context item to resolve and set as current.
   * @returns An Observable that emits the resolved and set {@link ContextItem}.
   *          Emits an error if the context cannot be resolved or set.
   */
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

  /**
   * Asynchronously sets the current context by its unique identifier and returns a promise
   * that resolves to the corresponding `ContextItem`.
   *
   * This method wraps the observable returned by `setCurrentContextById` into a promise,
   * allowing for async/await usage.
   *
   * @see {@link setCurrentContextById} for more details.
   *
   * @param id - The unique identifier of the context to set as current.
   * @returns A promise that resolves to the `ContextItem` associated with the given ID.
   */
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

  /**
   * Sets the current context, optionally validating and resolving it.
   *
   * This method emits the provided context as an observable. If the context is the same as the current one,
   * it emits and completes immediately. If validation is requested and fails, it either emits an error or,
   * if resolution is enabled, attempts to resolve the context before setting it. The method dispatches various
   * events to notify listeners about validation failures, resolution steps, and context changes, allowing
   * cancellation at several stages.
   *
   * ### Step-by-step process:
   * 1. **Check if the context is the same as the current one:**
   *    - If so, emit the context and complete the observable immediately.
   * 2. **Validate the context (if requested):**
   *    - If validation fails and resolution is not enabled:
   *      - Dispatch the `onSetContextValidationFailed` event.
   *      - Emit an error and complete.
   *    - If validation fails but resolution is enabled:
   *      - Dispatch the `onSetContextResolve` event (cancelable).
   *      - If canceled, throw an error and abort.
   *      - Attempt to resolve the context using `resolveContext`.
   *      - Dispatch the `onSetContextResolved` event (cancelable) after resolution.
   *      - If canceled, throw an error and abort.
   *      - Recursively call `_setCurrentContext` with the resolved context (without validation/resolution).
   * 3. **If validation passes or not requested:**
   *    - Dispatch the `onCurrentContextChange` event (cancelable).
   *    - If canceled, throw an error and abort.
   *    - Emit the context and complete the observable.
   *
   * @protected
   * @typeParam T - The type of the context item, which extends `ContextItem<Record<string, unknown>>` or can be `null`.
   * @param context - The new context to set.
   * @param opt - Optional settings:
   *   - `validate`: Whether to validate the context before setting.
   *   - `resolve`: Whether to attempt to resolve the context if validation fails.
   * @returns An `Observable<T>` that emits the context when set, or errors if validation or resolution fails.
   * @fires onSetContextValidationFailed - When context validation fails and resolution is not enabled.
   * @fires onSetContextResolve - Before attempting to resolve the context.
   * @fires onSetContextResolved - After the context has been resolved.
   * @fires onCurrentContextChange - Before changing the current context.
   * @throws Error if validation fails and resolution is not enabled, or if any event handler cancels the operation.
   */
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
                const event = await this.#event?.dispatchEvent('onSetContextResolve', {
                  source: this,
                  cancelable: true,
                  detail: { context },
                });
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
                const event = await this.#event?.dispatchEvent('onSetContextResolved', {
                  source: this,
                  cancelable: true,
                  detail: { context, resolved },
                });
                // check if event was canceled and abort if so
                if (event?.canceled) {
                  throw Error('resolving of context was canceled');
                }
                return resolved;
              }),
              // recursive call to set current context without validation and resolution
              switchMap((resolved) => this._setCurrentContext(resolved as unknown as T)),
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

  /**
   * Asynchronously sets the current context and returns a promise that resolves with the provided context.
   *
   * @see {@link setCurrentContext} for more details.
   *
   * @typeParam T - The type of the context item, which extends `ContextItem<Record<string, unknown>>` or can be `null`.
   * @param context - The context item to set as the current context, or `null` to clear it.
   * @param opt - Optional settings for context handling.
   * @param opt.validate - If `true`, validates the context before setting it.
   * @param opt.resolve - If `true`, resolves any dependencies or references in the context before setting it.
   * @returns A promise that resolves with the context item that was set.
   */
  public async setCurrentContextAsync<T extends ContextItem<Record<string, unknown>> | null>(
    context: T,
    opt?: { validate?: boolean; resolve?: boolean },
  ): Promise<T> {
    return lastValueFrom(this.setCurrentContext(context, opt));
  }

  /**
   * Queries the context for items matching the provided search string.
   *
   * This method constructs query parameters using the given search term and the current context type,
   * then executes the query using the internal query client. If a context filter is defined, it is applied
   * to the results before emitting them. Errors thrown by the query client of type `QueryClientError` will
   * have their underlying cause re-thrown.
   *
   * @param search - The search string to filter context items.
   * @returns An Observable that emits an array of `ContextItem` objects matching the search criteria.
   */
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

  /**
   * Asynchronously queries the context for items matching the provided search string.
   *
   * @see {@link queryContext} for more details.
   *
   * @param search - The search string used to filter context items.
   * @returns A promise that resolves to an array of `ContextItem` objects matching the search criteria.
   */
  public queryContextAsync(search: string): Promise<Array<ContextItem>> {
    return lastValueFrom(this.queryContext(search));
  }

  /**
   * Validates whether the provided context item matches one of the allowed context types.
   *
   * @param item - The context item to validate, containing a type with an `id` property.
   * @returns `true` if the context type is not set or if the item's type ID matches one of the allowed types (case-insensitive); otherwise, `false`.
   */
  public validateContext(item: ContextItem<Record<string, unknown>>): boolean {
    if (!this.#contextType) return true;
    return this.#contextType.map((x) => x.toLowerCase()).includes(item.type.id.toLowerCase());
  }

  /**
   * Resolves a context item by fetching related context items of the same type as configured in the provider.
   *
   * This method:
   * - Requests related context items matching the provider's context type.
   * - Filters out invalid context items using `validateContext`.
   * - Selects the first valid context item, throwing an error if none are found.
   * - Logs a warning if multiple valid context items are found.
   * - Returns the resolved context item as an observable.
   *
   * @param item - The context item for which to resolve related context.
   * @returns An observable emitting the resolved context item.
   * @throws Error if no valid related context item is found.
   */
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
          console.warn('ContextProvider::relatedContext', 'multiple items found 🤣', values);
        }

        // return the resolved context item
        return value;
      }),
    );
  }

  /**
   * Asynchronously resolves the provided context item.
   *
   * @see {@link resolveContext} for more details.
   *
   * @param item - The context item to resolve.
   * @returns A promise that resolves to the resolved context item.
   */
  public resolveContextAsync(
    item: ContextItem<Record<string, unknown>>,
  ): Promise<ContextItem<Record<string, unknown>>> {
    return lastValueFrom(this.resolveContext(item));
  }

  /**
   * Retrieves related context items based on the provided parameters.
   *
   * This method queries the related context client to fetch an array of context items
   * that are related to the specified parameters. If the related context client is not
   * available, it returns an observable that emits an error.
   *
   * @param args - The parameters used to query for related context items.
   * @returns An Observable that emits an array of related context items.
   * @throws Error if no related context client is defined or if the query fails.
   */
  public relatedContexts(
    args: RelatedContextParameters,
  ): Observable<Array<ContextItem<Record<string, unknown>>>> {
    // check if related context client is available
    if (!this.#contextRelated) {
      return throwError(() =>
        Error('ContextProvider::relatedContexts - no client defined for resolving related context'),
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

  /**
   * Asynchronously retrieves an array of related context items based on the provided parameters.
   *
   * @see {@link relatedContexts} for more details.
   *
   * @param args - The parameters used to determine which related contexts to retrieve.
   * @returns A promise that resolves to an array of `ContextItem` objects containing generic records.
   */
  public relatedContextsAsync(
    args: RelatedContextParameters,
  ): Promise<Array<ContextItem<Record<string, unknown>>>> {
    return lastValueFrom(this.relatedContexts(args));
  }

  /**
   * Clears the current context by setting it to null.
   *
   * This method is typically used to reset or remove the active context,
   * ensuring that subsequent operations do not reference any previous context state.
   */
  public clearCurrentContext(): void {
    this.setCurrentContext(null);
  }

  /**
   * Disposes of resources held by the context provider.
   *
   * Unsubscribes from all active subscriptions and disposes of the context client,
   * ensuring that any allocated resources are properly released.
   */
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
