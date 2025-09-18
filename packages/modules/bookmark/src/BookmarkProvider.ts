import { Observable, Subscription, forkJoin, from, lastValueFrom, of, defer } from 'rxjs';

import {
  filter,
  switchMap,
  tap,
  map,
  mergeScan,
  timeout,
  raceWith,
  first,
  catchError,
} from 'rxjs/operators';

import { castDraft, createDraft, finishDraft } from 'immer';

import { v4 as generateGUID } from 'uuid';

import deepEqual from 'fast-deep-equal/es6';

import {
  FrameworkEvent,
  type FrameworkEventInitType,
} from '@equinor/fusion-framework-module-event';

import { isFailureAction } from '@equinor/fusion-observable';

import { SemanticVersion } from '@equinor/fusion-framework-module';

import type {
  Bookmark,
  BookmarkData,
  BookmarkWithoutData,
  Bookmarks,
  BookmarkModuleConfig,
} from './types';

import type { BookmarkNew, BookmarkUpdate, IBookmarkClient } from './BookmarkClient.interface';
import { type BookmarkActions, bookmarkActions } from './BookmarkProvider.actions';
import {
  type BookmarkState,
  createBookmarkStore,
  type BookmarkStore,
} from './BookmarkProvider.store';
import {
  activeBookmarkSelector,
  bookmarkSelector,
  bookmarksSelector,
  errorsSelector,
} from './BookmarkProvider.selectors';

import { type BookmarkFlowError, BookmarkProviderError } from './BookmarkProvider.error';

import type { BookmarkProviderEventMap } from './BookmarkProvider.events';
import { version } from './version';

import type {
  BookmarkCreateArgs,
  BookmarkPayloadGenerator,
  BookmarkUpdateOptions,
  IBookmarkProvider,
} from './BookmarkProvider.interface';

// Default timeout for bookmark operations (2 minutes)
const defaultTimeout = 2 * 60 * 1000;

/**
 * The `BookmarkProvider` class is responsible for managing bookmarks in the application.
 * It provides methods for creating, updating, and removing bookmarks, as well as managing the current bookmark and the list of bookmarks.
 *
 * The `BookmarkProvider` uses a `BookmarkStore` to manage the state of the bookmarks, and an `IBookmarkClient` to interact with the backend API.
 *
 * The `BookmarkProvider` also supports event listeners for various bookmark-related events, such as when the current bookmark changes or when a bookmark is created, updated, or removed.
 */
export class BookmarkProvider implements IBookmarkProvider {
  /** provided configuration for the bookmark provider */
  #config: BookmarkModuleConfig;

  /** state machine of the bookmark provider */
  #store: BookmarkStore;

  /** collection of callback for creating bookmark payload */
  #payloadGenerators: Array<BookmarkPayloadGenerator> = [];

  /** collection of subscriptions for bookmark events */
  #subscriptions = new Subscription();

  /**
   * @deprecated
   * this will be removed as soon as applications have been migrated to use the bookmark provider
   */
  get config() {
    return {
      getCurrentAppIdentification() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return window.Fusion.modules.app.current.appKey;
      },
    };
  }

  /**
   * @deprecated
   * this will be removed as soon as applications have been migrated to use the bookmark provider
   */
  addStateCreator<T extends BookmarkData>(fn: BookmarkPayloadGenerator<T>) {
    console.warn('addStateCreator is deprecated, use addPayloadGenerator instead');
    return this.addPayloadGenerator(fn);
  }

  /**
   * @deprecated
   * this will be removed as soon as applications have been migrated to use the bookmark provider
   */
  deleteBookmarkByIdAsync(id: string): Promise<void> {
    console.warn('deleteBookmarkByIdAsync is deprecated, use deleteBookmarkAsync instead');
    return this.deleteBookmarkAsync(id);
  }

  /**
   * @deprecated
   * this will be removed as soon as applications have been migrated to use the bookmark provider
   */
  addBookmarkFavoriteAsync(id: string): Promise<Bookmark | undefined> {
    console.warn('addBookmarkFavoriteAsync is deprecated, use addBookmarkToFavoritesAsync instead');
    return this.addBookmarkToFavoritesAsync(id);
  }

  /**
   * @deprecated
   * this will be removed as soon as applications have been migrated to use the bookmark provider
   */
  removeBookmarkFavoriteAsync(id: string): Promise<void> {
    console.warn(
      'removeBookmarkFavoriteAsync is deprecated, use removeBookmarkAsFavoriteAsync instead',
    );
    return this.removeBookmarkAsFavoriteAsync(id);
  }

  /**
   * @deprecated
   * this will be removed as soon as applications have been migrated to use the bookmark provider
   */
  getBookmarkById(id: string): Promise<Bookmark | null> {
    console.warn('getBookmarkById is deprecated, use getBookmarkAsync instead');
    return this.getBookmarkAsync(id);
  }

  /**
   * Gets the semantic version of the bookmark provider.
   */
  public get version(): SemanticVersion {
    return new SemanticVersion(version);
  }

  public get filters(): BookmarkModuleConfig['filters'] {
    // TODO - freeze the config object?
    return this.#config.filters;
  }

  /**
   * Gets the `IBookmarkClient` instance used by this `BookmarkProvider`.
   */
  public get client(): IBookmarkClient {
    return this.#config.client;
  }

  /**
   * Gets the currently active bookmark (if any).
   */
  public get currentBookmark$(): Observable<Bookmark | null | undefined> {
    return this.#store.select(activeBookmarkSelector);
  }

  /**
   * Gets an observable that emits the current list of bookmarks.
   */
  public get bookmarks$(): Observable<Array<BookmarkWithoutData>> {
    this.getAllBookmarksAsync();
    return this.#store.select(bookmarksSelector, deepEqual);
  }

  /**
   * Gets the current list of bookmarks.
   */
  public get bookmarks(): Array<BookmarkWithoutData> {
    return bookmarksSelector(this.#store.value);
  }

  /**
   * Gets the currently active bookmark.
   */
  public get currentBookmark(): Bookmark | null | undefined {
    const bookmark = activeBookmarkSelector(this.#store.value);
    return bookmark;
  }

  /**
   * Represents an observable stream of the bookmark status.
   */
  public get status$(): Observable<BookmarkState['status']> {
    return this.#store.select((x) => x.status);
  }

  /**
   * Gets an observable that emits the current list of bookmark errors.
   */
  public get errors$(): Observable<Array<BookmarkFlowError>> {
    // TODO - add deep diff
    return this.#store.select(errorsSelector, deepEqual);
  }

  /**
   * Determines whether there are any bookmark creators configured.
   * `true` if there are any bookmark creators configured, `false` otherwise.
   */
  public get canCreateBookmarks(): boolean {
    return this.#payloadGenerators.length > 0;
  }

  /**
   * Gets the source system value from the configuration.
   */
  public get sourceSystem(): BookmarkModuleConfig['sourceSystem'] {
    return this.#config.sourceSystem;
  }

  /**
   * Gets the resolved application from the bookmark module configuration.
   */
  public get resolvedApplication(): BookmarkModuleConfig['resolve']['application'] {
    return this.#config.resolve.application;
  }

  /**
   * Gets the resolved context from the bookmark module configuration.
   */
  public get resolvedContext(): BookmarkModuleConfig['resolve']['context'] {
    return this.#config.resolve.context;
  }

  protected get _apiClient(): IBookmarkClient {
    return this.#config.client;
  }

  /**
   * configured logger instance.
   */
  protected get _log(): BookmarkModuleConfig['log'] {
    return this.#config.log;
  }

  /**
   * configured resolvers
   */
  protected get _resolve(): BookmarkModuleConfig['resolve'] {
    return this.#config.resolve;
  }

  /**
   * configured event provider.
   */
  protected get _event(): BookmarkModuleConfig['eventProvider'] {
    return this.#config.eventProvider;
  }

  /**
   * configured parent bookmark provider
   */
  protected get _parent(): BookmarkModuleConfig['parent'] {
    return this.#config.parent;
  }

  /**
   * Constructs a new `BookmarkProvider` instance.
   *
   * @param config - The configuration for the bookmark module, including the client, initial state, and optional parent provider.
   */
  constructor(config: BookmarkModuleConfig) {
    this.#config = config;

    this.#store = createBookmarkStore({
      client: config.client,
      initial: { currentBookmark: this._parent?.currentBookmark ?? null },
    });

    // add teardown logic for disposing the store
    this.#subscriptions.add(() => this.#store.complete());

    // subscribe to the store actions and log them
    this.#subscriptions.add(
      this.#store.action$.subscribe((action) => {
        if (isFailureAction(action)) {
          this._log?.error(`Action: ${action.type}`, action);
        } else {
          this._log?.debug(`Action: ${action.type}`, action);
        }
      }),
    );

    // subscribe to the current bookmark changes and dispatch events
    this.#subscriptions.add(
      this.#store.select(activeBookmarkSelector).subscribe((bookmark) => {
        // do not emit before the first value
        if (bookmark !== undefined) {
          this._dispatchEvent('onCurrentBookmarkChanged', { detail: bookmark });
        }
      }),
    );

    // subscribe to child bookmark provider changes
    // TODO - add support for disabling this feature
    if (this._event) {
      this._event.addEventListener('onCurrentBookmarkChanged', (event) => {
        const { source, detail } = event;

        // ignore events without detail
        if (detail === undefined) return;

        // only update the current bookmark if the event source is not this provider
        if (source !== this && detail !== this.currentBookmark) {
          this.#store.next(bookmarkActions.setCurrentBookmark(detail));
        }
      });
    }

    if (this._parent) {
      // if a parent bookmark provider is configured, subscribe to its current bookmark changes
      try {
        this.#subscriptions.add(
          this._parent.currentBookmark$
            .pipe(
              filter((x): x is Bookmark => x !== undefined),
              filter((x) => x !== this.currentBookmark),
            )
            .subscribe((bookmark) => {
              this.#store.next(bookmarkActions.setCurrentBookmark(bookmark));
            }),
        );
      } catch (e) {
        this._log?.error('Failed to subscribe to parent bookmark provider', e);
      }
    }
  }

  /**
   * Registers an event listener for the specified event on the BookmarkProvider.
   *
   * @param eventName - The name of the event to listen for. Must be a key of the `BookmarkProviderEventMap` type.
   * @param callback - The callback function to be invoked when the event is triggered.
   *      The callback will receive the event object as its parameter, which will be of the type corresponding to the `eventName`.
   * @returns A function that can be called to remove the event listener.
   */
  public on<TType extends keyof BookmarkProviderEventMap>(
    eventName: TType,
    callback: (event: BookmarkProviderEventMap[TType]) => void,
  ): VoidFunction {
    if (!this._event) {
      this._log?.warn('Failed to register event listener, event provider not configured');
      return () => {
        // No-op function when event provider is not configured
      };
    }
    return this._event.addEventListener(eventName, (event) => {
      if (event.source === this) {
        callback(event);
      }
    });
  }
  /**
   * Adds a new payload generator function to the BookmarkProvider.
   * The payload generator function will be used to generate the payload for a bookmark-related action.
   *
   * @param fn - The payload generator function to add. It should be of type `PayloadGenerator<T>`, where `T` is the type of the bookmark data.
   * @returns A function that can be called to remove the added payload generator.
   */
  public addPayloadGenerator<T extends BookmarkData>(
    fn: BookmarkPayloadGenerator<T>,
  ): VoidFunction {
    this._log?.debug(`adding bookmark payload generator: ${fn.name}`);

    // register the payload generator function
    this.#payloadGenerators.push(fn as BookmarkPayloadGenerator);

    // dispatch event to notify listeners of the added payload generator
    this._dispatchEvent('onBookmarkPayloadCreatorAdded', {
      detail: fn as BookmarkPayloadGenerator,
    });

    // return a function to remove the added payload generator
    return () => {
      this._log?.debug(`removing bookmark payload generator: ${fn.name}`);
      this.#payloadGenerators = this.#payloadGenerators.filter((g) => g !== fn);
    };
  }

  /**
   * Generates a payload by applying registered generator functions to an accumulator object.
   *
   * @param initial - The initial value of the accumulator object.
   * @returns An observable that emits the generated payload.
   * @template T - The type of the generated payload.
   */
  public generatePayload<T extends BookmarkData = BookmarkData>(
    initial?: Partial<T> | null,
  ): Observable<T | null | undefined> {
    this._log?.debug('generating payload', initial);

    /**
     * Observable that emits the generated payload.
     */
    const result$ = from(this.#payloadGenerators).pipe(
      mergeScan(
        (acc, generator) => from(Promise.resolve(this._producePayload(acc, generator))),
        initial ?? ({} as Partial<T>),
        1,
      ),
      tap((payload) => this._log?.debug('generated payload', { initial, payload })),
    ) as Observable<T | null | undefined>;

    return result$;
  }

  /**
   * Produces a payload using the provided generator function.
   *
   * @template T - The type of the bookmark data.
   * @param value - The partial value to be used as the base for the payload.
   * @param generator - The function that generates the payload.
   * @param initial - An optional initial value to be passed to the generator.
   * @returns The produced payload or null if the generator wishes to clear the bookmark data.
   *
   * @remarks
   * The generator function should not return a value, as the data is an immer draft object.
   * If the generator returns a value, a warning will be logged.
   * If the generator returns null, an info message will be logged indicating that the bookmark data should be cleared.
   */
  protected async _producePayload<T extends BookmarkData = BookmarkData>(
    value: Partial<T>,
    generator: BookmarkPayloadGenerator<T>,
    initial?: Partial<T> | null,
  ): Promise<T | null | undefined> {
    // Create a draft for async operations using createDraft/finishDraft pattern
    const draft = createDraft(value);

    try {
      const generatorResult = await Promise.resolve(generator(draft as Partial<T>, initial));

      // Handle the generator result
      if (generatorResult) {
        this._log?.warn(
          `bookmark data generator ${generator.name} returned a value, but it should not do this, since the data is an immer draft object`,
        );
        // Dirty fix since some developers are returning the reference object, which will freeze the object
        return castDraft(generatorResult) as T | null | undefined;
      }

      // clear the bookmark data if the generator returns null
      if (generatorResult === null) {
        this._log?.info(
          `bookmark data generator ${generator.name} wish to clear the bookmark data`,
        );
        return undefined;
      }
    } catch (error) {
      this._log?.error(`Failed to produce payload using generator ${generator.name}`, error);
    }

    // Finish the draft to get the immutable result
    const result = finishDraft(draft);

    return result as T | null | undefined;
  }

  /**
   * Retrieves a bookmark with the specified bookmarkId and returns an observable that emits the combined result of fetching the bookmark and bookmark data.
   * @template T The type of the bookmark payload.
   * @param bookmarkId The unique identifier of the bookmark.
   * @param options An optional object that allows excluding the bookmark payload from the result.
   * @returns An observable that emits the combined result of fetching the bookmark and bookmark data.
   */
  public getBookmark<T extends BookmarkData = BookmarkData>(
    bookmarkId: string,
    options?: { excludePayload?: boolean },
  ): Observable<Bookmark<T>> {
    this._log?.debug(`fetching bookmark: ${bookmarkId}`, options);

    // fetch the bookmark and bookmark data
    return forkJoin({
      bookmark: this._getBookmarkInfo(bookmarkId),
      payload: options?.excludePayload ? of({}) : this._getBookmarkData(bookmarkId),
    }).pipe(
      catchError((error) => {
        this._log?.error(`Failed to fetch bookmark: ${bookmarkId}`, error);
        throw error;
      }),
      // combine the bookmark and payload into a single object
      map(({ bookmark, payload }) => Object.assign({}, bookmark, { payload }) as Bookmark<T>),
      tap((bookmark) => {
        this._log?.debug(`Bookmark fetched: ${bookmark.id}`, bookmark);
      }),
    );
  }

  /**
   * Retrieves a bookmark asynchronously.
   *
   * @param id - The ID of the bookmark to retrieve.
   * @param options - Optional parameters for the retrieval.
   * @param options.excludePayload - Specifies whether to exclude the payload from the bookmark.
   * @returns A promise that resolves to the retrieved bookmark, or null if the bookmark is not found.
   */
  public getBookmarkAsync<T extends BookmarkData = BookmarkData>(
    id: string,
    options?: { excludePayload?: boolean },
  ): Promise<Bookmark<T> | null> {
    return lastValueFrom(this.getBookmark<T>(id, options));
  }

  /**
   * Retrieves all bookmarks from the store as an Observable stream.
   * 
   * This method implements a complex flow that:
   * 1. Resolves filter parameters (sourceSystem, appKey, contextId) based on configuration
   * 2. Dispatches a fetch action to the store with resolved filters
   * 3. Monitors store actions for success/failure responses
   * 4. Returns the bookmarks data or throws appropriate errors
   *
   * @remarks
   * The method uses a reactive pattern where filter resolution and store actions are
   * handled asynchronously. If filtering is enabled, it will resolve the current
   * application and context to filter bookmarks accordingly.
   *
   * @example
   * ```ts
   * // Basic usage
   * bookmarkProvider.getAllBookmarks().subscribe({
   *   next: (bookmarks) => console.log('Retrieved bookmarks:', bookmarks),
   *   error: (err) => console.error('Failed to fetch bookmarks:', err)
   * });
   * 
   * // With filtering enabled in config
   * const config = {
   *   filters: { context: true, application: true }
   * };
   * // Will automatically filter by current context and application
   * ```
   *
   * @returns An Observable that emits the array of bookmarks when successfully retrieved
   * @throws {BookmarkProviderError} When filter resolution fails or store operations fail
   * @throws {BookmarkProviderError} When a timeout occurs during the fetch operation
   */
  public getAllBookmarks(): Observable<Bookmarks> {
    return new Observable<Bookmarks>((observer) => {
      this._log?.debug('fetching all bookmarks');

      // Step 1: Generate filter parameters based on configuration
      // This creates a stream that resolves all necessary filter values
      const filter$ = forkJoin({
        // Always include the source system for the current provider
        sourceSystem: of(this.sourceSystem),
        
        // Resolve application key if filtering by application is enabled
        appKey: this.#config.filters?.application
          ? defer(() => this._resolve.application()).pipe(map((x) => x?.appKey))
          : of(undefined),
        
        // Resolve context ID if filtering by context is enabled  
        contextId: this.#config.filters?.context
          ? defer(() => this._resolve.context()).pipe(map((x) => x?.id))
          : of(undefined),
      }).pipe(
        // Handle any errors during filter parameter resolution
        catchError((err) => {
          const error = new BookmarkProviderError(
            'Could not fetch bookmarks, failed to resolve filter parameters',
            err,
          );
          this._log?.error(error.message, error);
          throw error;
        }),
      );

      // Step 2: Dispatch fetch action to store when filter parameters are ready
      // This triggers the actual API call through the store's action system
      // The store will handle the async operation and emit success/failure actions
      // Using observer.add() ensures proper cleanup when the Observable is unsubscribed
      observer.add(
        filter$.subscribe((filter) => {
          this.#store.next(bookmarkActions.fetchBookmarks(filter));
        }),
      );

      // Step 3: Monitor for failure responses from the store
      // This stream will emit and throw an error if the fetch operation fails
      const failure$ = this.#store.action$.pipe(
        filter(bookmarkActions.fetchBookmarks.failure.match),
        map((action) => {
          this._log?.error('Failed to fetch bookmarks', action.payload);
          throw new BookmarkProviderError('Failed to fetch bookmarks', action.payload);
        }),
        // Add timeout protection to prevent hanging requests
        timeout({
          each: defaultTimeout,
          with: () => {
            throw new BookmarkProviderError('Timeout while fetching bookmarks');
          },
        }),
      );

      // Step 4: Monitor for success responses from the store
      // This stream will emit the bookmarks data when successfully retrieved
      const request$ = this.#store.action$.pipe(
        filter(bookmarkActions.fetchBookmarks.success.match),
        map((a) => a.payload),
        tap((bookmarks) => {
          this._log?.debug('fetched all bookmarks', bookmarks);
        }),
        // Race against failure stream - whichever completes first wins
        // This ensures we either get the bookmarks data or an error, not both
        raceWith(failure$),
        // Only take the first emission (success or failure) to complete the stream
        first(),
      );

      // Step 5: Subscribe to the request stream and forward results to observer
      request$.subscribe(observer);
    });
  }

  /**
   * Asynchronously retrieves all bookmarks from the store.
   *
   * @returns A Promise that resolves to the Bookmarks object containing all bookmarks.
   */
  public async getAllBookmarksAsync(): Promise<Bookmarks> {
    return lastValueFrom(this.getAllBookmarks());
  }

  /**
   * Sets the current bookmark to the specified bookmark or ID.
   * If the bookmark is already the current bookmark, it returns the bookmark directly.
   * Otherwise, it emits the next bookmark or null through an observable.
   *
   * By proving `null` as the bookmark_or_id, the current bookmark will be cleared.
   *
   * @param bookmark_or_id - The bookmark or ID to set as the current bookmark.
   * @returns An observable that emits the next bookmark or null.
   * @template T - The type of the bookmark data.
   */
  public setCurrentBookmark<T extends BookmarkData = BookmarkData>(
    bookmark_or_id: Bookmark<T> | string | null,
  ): Observable<Bookmark<T> | null> {
    this._log?.debug('setting current bookmark', bookmark_or_id);

    // resolve the next bookmark
    const next$: Observable<Bookmark<T> | null> =
      typeof bookmark_or_id === 'string'
        ? this.getBookmark<T>(bookmark_or_id)
        : of(bookmark_or_id ?? null);

    return next$.pipe(
      switchMap(async (next) => {
        const current = this.currentBookmark;
        const { type, canceled } = await this._dispatchEvent('onCurrentBookmarkChange', {
          detail: { current, next },
        });
        if (canceled) {
          const error = new BookmarkProviderError(
            `event: ${type} was canceled by listener for change to ${next?.id ?? 'none'}, from ${current?.id ?? 'none'}`,
          );
          this._log?.info(error.message);
          throw error;
        }

        return next;
      }),
      tap((next) => {
        // set the current bookmark in the store
        this.#store.next(bookmarkActions.setCurrentBookmark(next));
      }),
      catchError((err) => {
        const error = new BookmarkProviderError(
          'Could not set current bookmark, resolve of bookmark failed',
          err,
        );
        this._log?.error(error.message, error);
        throw error;
      }),
    );
  }

  /**
   * Sets the current bookmark.
   * This method dispatches an event to notify listeners of a change in the current bookmark,
   * and then dispatches a request to set the active bookmark in the application state.
   *
   * The request will be canceled if the subscription is unsubscribed before the request completes.
   *
   * @param bookmarkId - The ID of the bookmark to set as the current bookmark.
   * @returns A subscription to the operation that sets the current bookmark.
   */
  public setCurrentBookmarkAsync<T extends BookmarkData = BookmarkData>(
    bookmark_or_id: Bookmark<T> | string | null,
  ): Promise<Bookmark<T> | null> {
    return lastValueFrom(this.setCurrentBookmark<T>(bookmark_or_id));
  }

  /**
   * Creates a new bookmark with the provided bookmark data.
   * The creation executes immediately when this method is called.
   * @template T - The type of bookmark data.
   * @param {BookmarkCreateArgs<T>} newBookmarkData - The data for creating the bookmark.
   * @returns {Observable<Bookmark<T>>} - An observable that emits the created bookmark.
   */
  public createBookmark<T extends BookmarkData = BookmarkData>(
    newBookmarkData: BookmarkCreateArgs<T>,
  ): Observable<Bookmark<T>> {
    const { ref, action$ } = this._useScopedActions();

    this._log?.debug(`creating new bookmark, ref: ${ref}`, newBookmarkData);

    // resolve the bookmark
    const bookmark$ = forkJoin({
      appKey: newBookmarkData.appKey
        ? of(newBookmarkData.appKey)
        : defer(() => this._resolve.application()).pipe(
            map((app) => {
              if (!app?.appKey) {
                throw new BookmarkProviderError('Failed to resolve application key');
              }
              return app.appKey;
            }),
          ),
      contextId: defer(() => this._resolve.context()).pipe(map((context) => context?.id)),
      payload: this.generatePayload<T>(newBookmarkData.payload),
      sourceSystem: of(this.sourceSystem),
    }).pipe(
      catchError((err) => {
        const error = new BookmarkProviderError(
          'Could not create new bookmark, failed to resolve bookmark data',
          err,
        );
        this._log?.error(error.message, error);
        throw error;
      }),
      // merge the resolved data with the new bookmark data
      map(
        (resolvedData) =>
          ({
            ...newBookmarkData,
            ...resolvedData,
          }) as BookmarkNew<T>,
      ),
    );

    // notify listeners that a bookmark is about to be created
    const dispatch$ = bookmark$.pipe(
      switchMap(async (bookmark) => {
        // notify listeners that a bookmark is about to be created
        const { canceled, type } = await this._dispatchEvent('onBookmarkCreate', {
          detail: bookmark,
          cancelable: true,
        });

        // throw an error if the event is canceled
        if (canceled) {
          const error = new BookmarkProviderError(
            `event: ${type} was canceled by listener for creating bookmark: ${ref}`,
          );
          this._log?.info(error.message);
          throw error;
        }

        return bookmark;
      }),
    );

    // Start the creation process immediately
    const createSubscription = dispatch$.subscribe({
      error: (error) => {
        this._log?.error(`Failed to prepare bookmark creation: ${ref}`, error);
      },
      next: (newBookmark) => {
        // request the store to create the bookmark
        this.#store.next(bookmarkActions.createBookmark(newBookmark, { ref }));
      },
    });

    // monitor the failure case when creating a bookmark
    const failure$ = action$.pipe(
      filter(bookmarkActions.createBookmark.failure.match),
      map(({ payload: cause }) => {
        const error = new BookmarkProviderError(`Failed to create bookmark: ${ref}`, {
          cause,
        });
        this._log?.warn(error.message);
        throw error;
      }),
      timeout({
        each: defaultTimeout,
        with: () => {
          throw new BookmarkProviderError(`Timeout while creating bookmark: ${ref}`);
        },
      }),
    );

    // monitor the success case when creating a bookmark
    const request$ = action$.pipe(
      filter(bookmarkActions.createBookmark.success.match),
      map(({ payload }) => payload as Bookmark<T>),
      tap((bookmark) => {
        this._log?.info(`Bookmark created: ${bookmark.id}, ref: ${ref}`);
        this._dispatchEvent('onBookmarkCreated', { detail: bookmark });
      }),
      raceWith(failure$),
      first(),
    );

    // Return the observable that will emit the result
    return new Observable<Bookmark<T>>((subscriber) => {
      // Clean up the create subscription when the result observable is unsubscribed
      subscriber.add(() => createSubscription.unsubscribe());

      // Emit the created bookmark
      request$.subscribe(subscriber);
    });
  }

  /**
   * Asynchronously creates a new bookmark.
   *
   * @param bookmark - The new bookmark to create.
   * @returns A promise that resolves to the created bookmark with its associated data.
   */
  public createBookmarkAsync<T extends BookmarkData = BookmarkData>(
    args: BookmarkCreateArgs<T>,
  ): Promise<Bookmark<T>> {
    return lastValueFrom(this.createBookmark<T>(args));
  }

  /**
   * Updates a bookmark with the specified bookmarkId and bookmarkUpdates.
   * The update executes immediately when this method is called.
   *
   * @template T - The type of the bookmark data.
   * @param {string} bookmarkId - The identifier of the bookmark to update.
   * @param {BookmarkUpdate<T>} [bookmarkUpdates] - The updates to apply to the bookmark.
   * @param {BookmarkUpdateOptions} [options] - The options for updating the bookmark.
   * @returns {Observable<Bookmark<T>>} - An observable that emits the updated bookmark.
   */
  public updateBookmark<T extends BookmarkData = BookmarkData>(
    bookmarkId: string,
    bookmarkUpdates?: BookmarkUpdate<T>,
    options?: BookmarkUpdateOptions,
  ): Observable<Bookmark<T>> {
    if (!bookmarkUpdates && options?.excludePayloadGeneration) {
      throw new BookmarkProviderError(
        'Cannot update bookmark without updates and excludePayloadGeneration option',
      );
    }

    const { ref, action$ } = this._useScopedActions();

    this._log?.debug(`Updating bookmark: ${bookmarkId}, ref: ${ref}`);

    /**
     * Generate updates with payload
     * @remarks
     * If `excludePayloadGeneration` is `true`, it emits the `bookmarkUpdates` directly.
     * If `excludePayloadGeneration` is `false`, it generates the payload using the `generatePayload` method and emits the updated `bookmarkUpdates` with the generated payload.
     */
    const updates$ = options?.excludePayloadGeneration
      ? of(bookmarkUpdates as BookmarkUpdate<T>)
      : this.generatePayload<T>(bookmarkUpdates?.payload).pipe(
          map(
            (payload) =>
              ({
                ...bookmarkUpdates,
                payload,
              }) as BookmarkUpdate<T>,
          ),
        );

    // notify listeners that a bookmark is about to be updated
    const dispatch$ = updates$.pipe(
      switchMap(async (updates) => {
        const { canceled, type } = await this._dispatchEvent('onBookmarkUpdate', {
          detail: {
            current: bookmarkSelector(this.#store.value, bookmarkId),
            updates,
          },
          cancelable: true,
        });

        if (canceled) {
          const error = new BookmarkProviderError(
            `event: ${type} was canceled by listener for updating bookmark: ${bookmarkId}, ref: ${ref}`,
          );
          this._log?.warn(error.message, updates);
          throw error;
        }

        return updates;
      }),
    );

    // Start the update process immediately
    const updateSubscription = dispatch$.subscribe({
      error: (error) => {
        this._log?.error(`Failed to prepare bookmark update: ${bookmarkId}`, error);
      },
      next: (updates) => {
        // trigger the store to update the bookmark
        this.#store.next(bookmarkActions.updateBookmark({ bookmarkId, updates }, { ref }));
      },
    });

    // monitor the failure case when updating a bookmark
    const failure$ = action$.pipe(
      filter(bookmarkActions.updateBookmark.failure.match),
      map(({ payload: cause }) => {
        const error = new BookmarkProviderError(`Failed to update bookmark: ${bookmarkId}`, {
          cause,
        });
        this._log?.info(error.message);
        throw error;
      }),
      timeout({
        each: defaultTimeout,
        with: () => {
          throw new BookmarkProviderError(`Timeout while updating bookmark: ${bookmarkId}`);
        },
      }),
    );

    // monitor the success case when updating a bookmark
    const request$ = action$.pipe(
      filter(bookmarkActions.updateBookmark.success.match),
      map(
        // TODO: add payload if current bookmark is the same as the updated bookmark
        ({ payload }): Bookmark<T> =>
          ({
            ...bookmarkSelector(this.#store.value, payload.id),
            payload: payload.payload,
          }) as Bookmark<T>,
      ),
      tap((bookmark) => {
        this._log?.info(`Bookmark updated: ${bookmark.id}, ref: ${ref}`);
        this._dispatchEvent('onBookmarkUpdated', { detail: bookmark });
      }),
      raceWith(failure$),
      first(),
    );

    // Return the observable that will emit the result
    return new Observable<Bookmark<T>>((subscriber) => {
      // Clean up the update subscription when the result observable is unsubscribed
      subscriber.add(() => updateSubscription.unsubscribe());

      // Emit the updated bookmark
      request$.subscribe(subscriber);
    });
  }

  /**
   * Updates a bookmark asynchronously.
   *
   * @todo - remove the deprecated method in the next major version
   *
   * @param bookmark - The bookmark to update.
   * @returns A promise that resolves to the updated bookmark with its associated data.
   */
  public updateBookmarkAsync<T extends BookmarkData = BookmarkData>(
    id_or_bookmark: string | Bookmark<T>,
    updates_or_options?: BookmarkUpdate<T> | BookmarkUpdateOptions,
    options?: BookmarkUpdateOptions,
  ): Promise<Bookmark<T>> {
    if (typeof id_or_bookmark === 'object') {
      // @deprecated
      console.warn(
        'updateBookmarkAsync(bookmark, updates, options) is deprecated, use updateBookmarkAsync(id, updates, options) instead',
      );
      const { id, ...updates } = id_or_bookmark as Bookmark<T>;
      return lastValueFrom(
        this.updateBookmark<T>(id, updates as BookmarkUpdate<T>, {
          excludePayloadGeneration: !(
            updates_or_options as unknown as {
              updatePayload: boolean;
            }
          ).updatePayload,
        }),
      );
    }
    return lastValueFrom(
      this.updateBookmark<T>(id_or_bookmark, updates_or_options as BookmarkUpdate<T>, options),
    );
  }

  /**
   * Deletes a bookmark with the specified bookmarkId.
   * The deletion executes immediately when this method is called.
   *
   * @param bookmarkId - The unique identifier of the bookmark to be deleted.
   * @returns An Observable that emits when the bookmark is successfully deleted.
   * @throws {BookmarkProviderError} If there is an error deleting the bookmark.
   */
  public deleteBookmark(bookmarkId: string): Observable<void> {
    const { ref, action$ } = this._useScopedActions();

    this._log?.debug(`Removing bookmark: ${bookmarkId}, ref: ${ref}`);

    // bookmark to delete
    const bookmark = bookmarkSelector(this.#store.value, bookmarkId) ?? {
      id: bookmarkId,
    };

    // observable that dispatches the 'onBookmarkDelete' event and maps the result
    const dispatch$ = from(
      this._dispatchEvent('onBookmarkDelete', {
        detail: bookmark,
        cancelable: true,
      }),
    ).pipe(
      map(({ canceled, type, detail }) => {
        if (canceled) {
          const error = new BookmarkProviderError(
            `event: ${type} was canceled by listener for removing bookmark: ${bookmarkId}, ref: ${ref}`,
          );
          this._log?.warn(error.message);
          throw error;
        }
        return detail;
      }),
    );

    // Start the deletion process immediately
    const deleteSubscription = dispatch$.subscribe({
      error: (error) => {
        this._log?.error(`Failed to prepare bookmark deletion: ${bookmarkId}`, error);
      },
      next: (bookmark) => {
        // request the store to delete the bookmark
        this.#store.next(bookmarkActions.deleteBookmark(bookmark.id, { ref }));
      },
    });

    // monitor the failure case when deleting a bookmark
    const failure$ = action$.pipe(
      filter(bookmarkActions.deleteBookmark.failure.match),
      map(({ payload: cause }) => {
        const error = new BookmarkProviderError(`Failed to delete bookmark: ${bookmarkId}`, {
          cause,
        });
        this._log?.warn(error.message);
        throw error;
      }),
      timeout({
        each: defaultTimeout,
        with: () => {
          throw new BookmarkProviderError(`Timeout while deleting bookmark: ${bookmarkId}`);
        },
      }),
    );

    // monitor the success case when deleting a bookmark
    const request$ = action$.pipe(
      filter(bookmarkActions.deleteBookmark.success.match),
      map(() => undefined),
      tap(() => {
        this._log?.info(`Removed bookmark: ${bookmark.id}, ref: ${ref}`);
        this._dispatchEvent('onBookmarkDeleted', { detail: bookmark });
      }),
      raceWith(failure$),
      first(),
    );

    // Return the observable that will emit the result
    return new Observable<void>((subscriber) => {
      // Clean up the delete subscription when the result observable is unsubscribed
      subscriber.add(() => deleteSubscription.unsubscribe());

      // Emit the deletion result
      request$.subscribe(subscriber);
    });
  }

  /**
   * Deletes a bookmark asynchronously.
   *
   * @param bookmarkId - The ID of the bookmark to delete.
   * @returns A Promise that resolves when the bookmark is deleted.
   */
  public async deleteBookmarkAsync(bookmarkId: string): Promise<void> {
    return lastValueFrom(this.deleteBookmark(bookmarkId));
  }

  /**
   * Adds a bookmark to the favorites.
   *
   * @param bookmarkId - The ID of the bookmark to add.
   * @returns A Promise that resolves to the added bookmark, or null if the bookmark was not added.
   */
  public addBookmarkToFavorites(bookmarkId: string): Observable<BookmarkWithoutData | undefined> {
    /**
     * Observable that represents the result of adding a bookmark as a favorite.
     * Emits a `Bookmark` object or `undefined` if the operation fails to resolve added bookmark.
     */
    const result$ = new Observable<Bookmark | undefined>((subscriber) => {
      const { ref, action$ } = this._useScopedActions();

      this._log?.debug(`Adding bookmark: ${bookmarkId} to favourites, ref: ${ref}`);

      // observable that dispatches the 'onBookmarkFavouriteAdd' event and maps the result
      const dispatch$ = from(
        this._dispatchEvent('onBookmarkFavouriteAdd', {
          detail: { id: bookmarkId },
          cancelable: true,
        }),
      ).pipe(
        map(({ canceled, type }) => {
          if (canceled) {
            const error = new BookmarkProviderError(
              `event: ${type} was canceled by listener for adding favourite bookmark: ${bookmarkId}, ref: ${ref}`,
            );
            this._log?.info(error.message);
            throw error;
          }
        }),
      );

      // execute the add bookmark as a favorite action when the event is not canceled
      subscriber.add(
        dispatch$.subscribe({
          error: (error) => subscriber.error(error),
          next: () => {
            this.#store.next(bookmarkActions.addBookmarkAsFavourite(bookmarkId, { ref }));
          },
        }),
      );

      // monitor the failure case when adding a bookmark as a favorite
      const failure$ = action$.pipe(
        filter(bookmarkActions.addBookmarkAsFavourite.failure.match),
        map(({ payload: cause }) => {
          const error = new BookmarkProviderError(
            `Failed to add bookmark to favorites: ${bookmarkId}`,
            { cause },
          );
          this._log?.warn(error.message);
          throw error;
        }),
        timeout({
          each: defaultTimeout,
          with: () => {
            throw new BookmarkProviderError(
              `Timeout while adding bookmark to favorites: ${bookmarkId}`,
            );
          },
        }),
      );

      // monitor the success case when adding a bookmark as a favorite
      const request$ = action$.pipe(
        filter(bookmarkActions.addBookmarkAsFavourite.success.match),
        switchMap(({ payload }) => this.getBookmark(payload, { excludePayload: true })),
        tap((bookmark) => {
          this._log?.info(`Added bookmark: ${bookmarkId} to favourites, ref: ${ref}`);
          this._dispatchEvent('onBookmarkFavouriteAdded', { detail: bookmark });
        }),
        raceWith(failure$),
        first(),
      );

      // emit the added bookmark
      return request$.subscribe(subscriber);
    });

    return result$;
  }

  /**
   * Asynchronously adds a bookmark to the user's favorites.
   *
   * @param bookmarkId - The ID of the bookmark to add to the user's favorites.
   * @returns A Promise that resolves to the added Bookmark, or null if the operation failed.
   */
  public addBookmarkToFavoritesAsync(bookmarkId: string): Promise<Bookmark | undefined> {
    return lastValueFrom(this.addBookmarkToFavorites(bookmarkId));
  }

  /**
   * Removes a bookmark as a favorite.
   *
   * @param bookmarkId - The ID of the bookmark to remove as a favorite.
   * @returns A Promise that resolves when the bookmark is successfully removed as a favorite.
   * @throws {BookmarkProviderError} If the event is canceled or if there is a failure in removing the bookmark as a favorite.
   */
  public removeBookmarkAsFavorite(bookmarkId: string): Observable<void> {
    /**
     * Represents an observable that emits void values when a bookmark's favorite is removed.
     */
    const result$ = new Observable<void>((subscriber) => {
      const { ref, action$ } = this._useScopedActions();

      this._log?.debug(`Removing bookmark: ${bookmarkId} from favourites, ref: ${ref}`);

      // get the bookmark to remove as a favorite
      const bookmark = bookmarkSelector(this.#store.value, bookmarkId) ?? { id: bookmarkId };

      // observable that dispatches the 'onBookmarkFavouriteRemove' event and maps the result
      const dispatch$ = from(
        this._dispatchEvent('onBookmarkFavouriteRemove', {
          detail: bookmark,
          cancelable: true,
        }),
      ).pipe(
        map(({ canceled, type, detail }) => {
          if (canceled) {
            const error = new BookmarkProviderError(
              `event: ${type} was canceled by listener for removing favourite bookmark: ${bookmarkId}, ref: ${ref}`,
            );
            this._log?.warn(error.message);
            throw error;
          }
          return detail;
        }),
      );

      // execute the remove bookmark as a favorite action when the event is not canceled
      subscriber.add(
        dispatch$.subscribe({
          error: (error) => subscriber.error(error),
          next: (detail) => {
            // request the store to remove the bookmark as a favorite
            this.#store.next(bookmarkActions.removeBookmarkAsFavourite(detail.id, { ref }));
          },
        }),
      );

      // monitor the failure case when removing a bookmark as a favorite
      const failure$ = action$.pipe(
        filter(bookmarkActions.removeBookmarkAsFavourite.failure.match),
        map(({ payload: cause }) => {
          const error = new BookmarkProviderError(
            `Failed to remove bookmark: ${bookmarkId} from favourites`,
            {
              cause,
            },
          );
          this._log?.warn(error.message);
          throw error;
        }),
        timeout({
          each: defaultTimeout,
          with: () => {
            throw new BookmarkProviderError(
              `Timeout while removing bookmark: ${bookmarkId} from favourites`,
            );
          },
        }),
      );

      // monitor the success case when removing a bookmark as a favorite
      const request$ = action$.pipe(
        filter(bookmarkActions.removeBookmarkAsFavourite.success.match),
        tap(() => {
          this._log?.info(`Removed bookmark: ${bookmarkId} from favourites, ref: ${ref}`);
          this._dispatchEvent('onBookmarkFavouriteRemoved', { detail: bookmark });
        }),
        map(() => undefined),
        raceWith(failure$),
        first(),
      );

      // emit the removed bookmark
      request$.subscribe(subscriber);
    });

    return result$;
  }

  /**
   * Removes a bookmark as a favorite asynchronously.
   *
   * @param bookmarkId - The ID of the bookmark to remove as a favorite.
   * @returns A Promise that resolves when the bookmark is successfully removed as a favorite.
   */
  public removeBookmarkAsFavoriteAsync(bookmarkId: string): Promise<void> {
    return lastValueFrom(this.removeBookmarkAsFavorite(bookmarkId));
  }

  /**
   * Checks if a bookmark is in the favorites.
   * @param bookmarkId - The ID of the bookmark to check.
   * @returns A promise that resolves to a boolean indicating whether the bookmark is in the favorites.
   */
  public isBookmarkInFavorites(bookmarkId: string): Observable<boolean> {
    this._log?.debug(`Checking if bookmark: ${bookmarkId} is in favourites`);

    // Check if the bookmark is a favorite
    return from(this._apiClient.isBookmarkFavorite(bookmarkId)).pipe(
      catchError((err) => {
        const error = new BookmarkProviderError(
          `Failed to check if bookmark: ${bookmarkId} is in favourites`,
          err,
        );
        this._log?.error(error.message, error);
        throw error;
      }),
      tap((isFavorite) => {
        this._log?.debug(`Bookmark: ${bookmarkId} is ${isFavorite ? 'in' : 'not in'} favourites`);
      }),
    );
  }

  /**
   * Checks if the specified bookmark is in the user's favorites.
   *
   * @param bookmarkId - The ID of the bookmark to check.
   * @returns A Promise that resolves to a boolean indicating whether the bookmark is in the user's favorites.
   */
  public isBookmarkInFavoritesAsync(bookmarkId: string): Promise<boolean> {
    return lastValueFrom(this.isBookmarkInFavorites(bookmarkId));
  }

  protected _getBookmarkInfo(
    bookmarkId: string,
    options?: { timeout?: number },
  ): Observable<BookmarkWithoutData> {
    // only actions with the specified reference are considered
    const { action$ } = this._useScopedActions(bookmarkId);

    // observable stream that emits the bookmark data when the fetch action is successful
    const success$ = action$.pipe(
      filter(bookmarkActions.fetchBookmark.success.match),
      map((action) => action.payload),
      first(),
    );

    // observable stream that emits an error when fetching bookmark data fails
    const failure$ = this.#store.action$.pipe(
      filter(bookmarkActions.fetchBookmark.failure.match),
      map((action) => {
        throw new BookmarkProviderError(
          `Failed to fetch bookmark data: ${bookmarkId}`,
          action.payload,
        );
      }),
      timeout({
        each: options?.timeout ?? 2 * 60 * 1000,
        with: () => {
          throw new BookmarkProviderError(`Timeout while fetching bookmark data: ${bookmarkId}`);
        },
      }),
    );

    this.#store.next(bookmarkActions.fetchBookmark(bookmarkId, { ref: bookmarkId }));

    return success$.pipe(raceWith(failure$));
  }

  protected _getBookmarkData<T extends BookmarkData = BookmarkData>(
    bookmarkId: string,
    options?: { timeout?: number },
  ): Observable<T | null> {
    // only actions with the specified reference are considered
    const { action$ } = this._useScopedActions(bookmarkId);

    // observable stream that emits the bookmark data when the fetch action is successful
    const success$ = action$.pipe(
      filter(bookmarkActions.fetchBookmarkData.success.match),
      map((action) => action.payload.data as T),
      first(),
    );

    // observable stream that emits an error when fetching bookmark data fails
    const failure$ = this.#store.action$.pipe(
      filter(bookmarkActions.fetchBookmarkData.failure.match),
      map((action) => {
        throw new BookmarkProviderError(
          `Failed to fetch bookmark data: ${bookmarkId}`,
          action.payload,
        );
      }),
      timeout({
        each: options?.timeout ?? defaultTimeout,
        with: () => {
          throw new BookmarkProviderError(`Timeout while fetching bookmark data: ${bookmarkId}`);
        },
      }),
    );

    // request the store to fetch the bookmark data
    this.#store.next(bookmarkActions.fetchBookmarkData(bookmarkId, { ref: bookmarkId }));

    return success$.pipe(raceWith(failure$));
  }

  /**
   * Dispatches an event of the specified type with the provided arguments.
   *
   * @param type - The type of the event to dispatch.
   * @param args - The arguments to pass to the event.
   * @returns A promise that resolves with the result of the event dispatch.
   */
  protected async _dispatchEvent<TType extends keyof BookmarkProviderEventMap>(
    type: TType,
    args: FrameworkEventInitType<BookmarkProviderEventMap[NoInfer<TType>]>,
  ): Promise<BookmarkProviderEventMap[NoInfer<TType>]> {
    // create a new event instance
    const event = new FrameworkEvent(type, {
      source: this,
      canBubble: true,
      ...args,
    }) as BookmarkProviderEventMap[NoInfer<TType>];

    if (this._event) {
      this._log?.debug(`dispatching event ${type}`, args);
      const { canceled } = await this._event.dispatchEvent(event);
      if (canceled) {
        this._log?.debug(`event ${type} was canceled`, args);
      }
    }
    return event;
  }

  protected _useScopedActions<TAction extends BookmarkActions>(
    ref?: string,
  ): {
    ref: string;
    action$: Observable<TAction>;
  } {
    /**
     * Generates a unique identifier for the operation
     */
    const operationRef = ref ?? generateGUID();

    /**
     * Observable stream of actions filtered by a specific reference.
     */
    const action$ = this.#store.action$.pipe(
      filter((action): action is TAction => 'meta' in action && action.meta?.ref === operationRef),
    );

    return { ref: operationRef, action$ };
  }

  /**
   * Disposes the BookmarkProvider.
   */
  dispose(): void {
    this._log?.debug('disposing BookmarkProvider');
    this.#subscriptions.unsubscribe();
  }

  [Symbol.dispose]() {
    this.dispose();
  }
}
