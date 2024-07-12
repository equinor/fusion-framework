import { EMPTY, Observable, Subscription, forkJoin, from, lastValueFrom, merge, of } from 'rxjs';

import {
    concatMap,
    filter,
    switchMap,
    mergeScan,
    tap,
    withLatestFrom,
    last,
    map,
} from 'rxjs/operators';

import { Draft, Patch, produce, enablePatches } from 'immer';

import { v4 as generateGUID } from 'uuid';

import {
    FrameworkEvent,
    FrameworkEventInitType,
    IFrameworkEvent,
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

import { BookmarkNew, BookmarkUpdate, type IBookmarkClient } from './BookmarkClient.interface';
import { bookmarkActions } from './BookmarkProvider.actions';
import { createBookmarkStore, type BookmarkStore } from './BookmarkProvider.store';
import {
    activeBookmarkSelector,
    bookmarkSelector,
    bookmarksSelector,
    errorsSelector,
} from './BookmarkProvider.selectors';

import { BookmarkFlowError, BookmarkProviderError } from './BookmarkProvider.error';

import { BookmarkProviderEventMap } from './BookmarkProvider.events';
import { version } from './version';

export type BookmarkPayloadGenerator<TData extends BookmarkData = BookmarkData> = (
    payload: Draft<Partial<TData>>,
    initial?: Partial<TData> | null,
) => Promise<Partial<TData> | void> | Partial<TData> | void;

export type BookmarkUpdateOptions = {
    excludePayloadGeneration?: boolean;
};

enablePatches();

/**
 * The `BookmarkProvider` class is responsible for managing bookmarks in the application.
 * It provides methods for creating, updating, and removing bookmarks, as well as managing the current bookmark and the list of bookmarks.
 *
 * The `BookmarkProvider` uses a `BookmarkStore` to manage the state of the bookmarks, and an `IBookmarkClient` to interact with the backend API.
 *
 * The `BookmarkProvider` also supports event listeners for various bookmark-related events, such as when the current bookmark changes or when a bookmark is created, updated, or removed.
 */
export class BookmarkProvider {
    /** provided configuration for the bookmark provider */
    #config: BookmarkModuleConfig;

    /** state machine of the bookmark provider */
    #store: BookmarkStore;

    /** collection of callback for creating bookmark payload */
    #payloadGenerators: Array<BookmarkPayloadGenerator> = [];

    /** collection of subscriptions for bookmark events */
    #subscriptions = new Subscription();

    /**
     * Gets the semantic version of the bookmark provider.
     */
    public get version(): SemanticVersion {
        return new SemanticVersion(version);
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
    public get currentBookmark$(): Observable<Bookmark | null> {
        return this.#store.select(activeBookmarkSelector);
    }

    /**
     * Gets an observable that emits the current list of bookmarks.
     */
    public get bookmarks$(): Observable<Array<BookmarkWithoutData>> {
        this.getAllBookmarks();
        // TODO - add deep diff
        return this.#store.select(bookmarksSelector);
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
        return activeBookmarkSelector(this.#store.value);
    }

    /**
     * Gets an observable that emits the current list of bookmark errors.
     */
    public get errors$(): Observable<Array<BookmarkFlowError>> {
        // TODO - add deep diff
        return this.#store.select(errorsSelector);
    }

    /**
     * Determines whether there are any bookmark creators configured.
     * `true` if there are any bookmark creators configured, `false` otherwise.
     */
    public get hasBookmarkCreators(): boolean {
        return this.#payloadGenerators.length > 0;
    }

    public get sourceSystem(): BookmarkModuleConfig['sourceSystem'] {
        return this.#config.sourceSystem;
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

        /** closed store on dispose */
        this.#subscriptions.add(() => this.#store.complete());

        /** Add logging for dispatched actions */
        this.#subscriptions.add(
            this.#store.action$.subscribe((action) => {
                if (isFailureAction(action)) {
                    this._log?.error(`Action: ${action.type}`, action);
                } else {
                    this._log?.debug(`Action: ${action.type}`, action);
                }
            }),
        );

        /** Notify when current bookmark is changed */
        this.#subscriptions.add(
            this.#store.select(activeBookmarkSelector).subscribe((bookmark) => {
                this._dispatchEvent('onCurrentBookmarkChanged', { detail: bookmark });
            }),
        );

        if (this._parent) {
            try {
                this.#subscriptions.add(
                    this._parent.currentBookmark$.subscribe((bookmark) => {
                        this.setCurrentBookmark(bookmark);
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
            console.warn('BookmarkProvider: event provider not configured');
            return () => {};
        }
        return this._event?.addEventListener(eventName, callback);
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
        this.#payloadGenerators.push(fn as BookmarkPayloadGenerator);
        this._dispatchEvent('onBookmarkPayloadCreatorAdded', {
            detail: fn as BookmarkPayloadGenerator,
        });
        return () => {
            this.#payloadGenerators = this.#payloadGenerators.filter((g) => g !== fn);
        };
    }

    /**
     * Retrieves a single bookmark by its ID.
     *
     * @param id - The ID of the bookmark to retrieve.
     * @returns An observable that emits the requested bookmark, or null if the bookmark is not found.
     */
    public getBookmark<T extends BookmarkData>(id: string): Observable<Bookmark<T> | null> {
        return this._fetchBookmarkById<T>(id);
    }

    public getBookmarkAsync<T extends BookmarkData>(id: string): Promise<Bookmark<T> | null> {
        return lastValueFrom(this.getBookmark<T>(id));
    }

    /**
     * Retrieves all bookmarks from the store as an observable stream.
     *
     * This method generates a request to fetch bookmarks from the store and returns an observable
     * that emits the successful result or throws an error if the fetch operation fails.
     *
     * @returns An observable stream that emits the Bookmarks object containing all bookmarks.
     */
    public getAllBookmarks(): Observable<Bookmarks> {
        /** An observable stream that emits the successful result of fetching bookmarks from the store. */
        const success$ = this.#store.action$.pipe(
            filter(bookmarkActions.fetchBookmarks.success.match),
            map((a) => a.payload),
        );

        /** An observable stream that emits the error result of fetching bookmarks from the store. */
        const failure$ = this.#store.action$.pipe(
            filter(bookmarkActions.fetchBookmarks.failure.match),
            map((a) => {
                throw a.payload;
            }),
        );

        /** Generate filter and request store to fetch bookmarks. */
        forkJoin({
            sourceSystem: of(this.sourceSystem),
            appKey: this.#config.filters?.application
                ? from(this._resolve.application()).pipe(map((x) => x?.appKey))
                : EMPTY,
            contextId: this.#config.filters?.context
                ? from(this._resolve.context()).pipe(map((x) => x?.id))
                : EMPTY,
        }).subscribe(this.#store.execute.fetchBookmarks);

        /** Merges the success and failure streams. */
        return merge(success$, failure$);
    }

    /**
     * Asynchronously retrieves all bookmarks from the store.
     *
     * @returns A Promise that resolves to the Bookmarks object containing all bookmarks.
     */
    public getAllBookmarksAsync(): Promise<Bookmarks> {
        return lastValueFrom(this.getAllBookmarks());
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
    public setCurrentBookmark<T extends BookmarkData>(
        bookmark_or_id: Bookmark<T> | string | null,
    ): Observable<Bookmark<T> | null> {
        return this._setCurrentBookmark<T>(bookmark_or_id);
    }

    /**
     * Creates a new bookmark with the provided data.
     *
     * @note the execution of creating a bookmark will not occur until the returned observable is subscribed to.
     * @param bookmark - The new bookmark to create.
     * @returns An observable that emits the created bookmark with its associated data.
     */
    public createBookmark<T extends BookmarkData>(
        bookmark: BookmarkNew<T>,
    ): Observable<Bookmark<T>> {
        return this._createBookmark<T>(bookmark);
    }

    /**
     * Asynchronously creates a new bookmark.
     *
     * @param bookmark - The new bookmark to create.
     * @returns A promise that resolves to the created bookmark with its associated data.
     */
    public createBookmarkAsync<T extends BookmarkData>(
        bookmark: BookmarkNew<T>,
    ): Promise<Bookmark<T>> {
        return lastValueFrom(this.createBookmark<T>(bookmark));
    }

    /**
     * Updates a bookmark with the provided patch.
     *
     * @param bookmark - The bookmark to update, with the changes to apply.
     * @returns An observable that emits the updated bookmark with its data.
     */
    public updateBookmark<T extends BookmarkData>(
        bookmarkId: string,
        bookmarkUpdates?: BookmarkUpdate<T>,
        options?: BookmarkUpdateOptions,
    ): Observable<Bookmark<T>> {
        return this._updateBookmark<T>(bookmarkId, bookmarkUpdates, options);
    }

    /**
     * Updates a bookmark asynchronously.
     *
     * @param bookmark - The bookmark to update.
     * @returns A promise that resolves to the updated bookmark with its associated data.
     */
    public updateBookmarkAsync<T extends BookmarkData>(
        bookmarkId: string,
        bookmarkUpdates?: BookmarkUpdate<T>,
        options?: BookmarkUpdateOptions,
    ): Promise<Bookmark<T>> {
        return lastValueFrom(this.updateBookmark<T>(bookmarkId, bookmarkUpdates, options));
    }

    /**
     * Removes a bookmark from the user.
     * @param bookmarkId - The unique identifier of the bookmark to remove.
     * @returns An observable that emits 'delete_bookmark' if the bookmark belonged to the user, or
     * 'remove_favourite_bookmark' if the bookmark was a favourite.
     */
    public removeBookmark(
        bookmarkId: string,
    ): Observable<'delete_bookmark' | 'remove_favourite_bookmark'> {
        return this._removeBookmark(bookmarkId);
    }

    /**
     * Removes a bookmark from the user's account.
     *
     * @param bookmarkId - The ID of the bookmark to remove.
     * @returns A promise that resolves to either 'delete_bookmark' or 'remove_favourite_bookmark', indicating the result of the bookmark removal operation.
     */
    public async removeBookmarkAsync(
        bookmarkId: string,
    ): Promise<'delete_bookmark' | 'remove_favourite_bookmark'> {
        return lastValueFrom(this._removeBookmark(bookmarkId));
    }

    /**
     * Adds the specified bookmark to the user's favorites.
     *
     * @param bookmarkId - The ID of the bookmark to add to favorites.
     * @returns An observable that emits the updated bookmark, or null if failed to fetch the bookmark.
     */
    public addBookmarkToFavorites(bookmarkId: string): Observable<Bookmark | null> {
        return this._addBookmarkToFavorites(bookmarkId);
    }

    /**
     * Asynchronously adds a bookmark to the user's favorites.
     *
     * @param bookmarkId - The ID of the bookmark to add to the user's favorites.
     * @returns A Promise that resolves to the added Bookmark, or null if the operation failed.
     */
    public addBookmarkToFavoritesAsync(bookmarkId: string): Promise<Bookmark | null> {
        return lastValueFrom(this._addBookmarkToFavorites(bookmarkId));
    }

    /**
     * Checks if the specified bookmark is in the user's favorites.
     *
     * @param bookmarkId - The ID of the bookmark to check.
     * @returns An observable that emits `true` if the bookmark is in the user's favorites, `false` otherwise.
     */
    public isBookmarkInFavorites(bookmarkId: string): Observable<boolean> {
        return this._isBookmarkInFavorites(bookmarkId);
    }

    /**
     * Checks if the specified bookmark is in the user's favorites.
     *
     * @param bookmarkId - The ID of the bookmark to check.
     * @returns A Promise that resolves to a boolean indicating whether the bookmark is in the user's favorites.
     */
    public isBookmarkInFavoritesAsync(bookmarkId: string): Promise<boolean> {
        return lastValueFrom(this._isBookmarkInFavorites(bookmarkId));
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
    ): Promise<IFrameworkEvent> {
        const event = new FrameworkEvent(type, { source: this, canBubble: true, ...args });
        if (this._event) {
            this._log?.debug(`dispatching event ${type}`, args);
            const { canceled } = await this._event.dispatchEvent(event);
            if (canceled) {
                this._log?.debug(`event ${type} was canceled`, args);
            }
        }
        return event;
    }

    /**
     * Generates a payload object by applying a series of payload generators to an initial partial object.
     *
     * @param initial - An optional initial partial object to start with.
     * @returns An observable that emits the final payload object, or null if any of the generators returned null.
     */
    protected _generatePayload<T extends BookmarkData>(
        initial?: Partial<T> | null,
    ): Observable<T | null | undefined> {
        return from(this.#payloadGenerators).pipe(
            mergeScan(
                (acc, generator) => {
                    /** use immer to handle the payload modifications */
                    return produce(
                        acc,
                        async (payload) => {
                            /** execute the registered generator */
                            const result = await Promise.resolve(
                                generator(payload as Partial<BookmarkData>, initial),
                            );
                            if (result === null) {
                                this._log?.info(
                                    `bookmark data generator ${generator.name} wish to clear the bookmark data`,
                                );
                                return null;
                            } else if (result) {
                                this._log?.warn(
                                    `bookmark data generator ${generator.name} returned a value, but it should not do this, since the data is an immer draft object`,
                                );
                                Object.assign(payload ?? {}, result) as T;
                            }
                        },
                        (patches: Patch[]) => {
                            if (patches.length > 0) {
                                this._log?.debug(
                                    `bookmark data generator ${generator.name} produced patches`,
                                    patches,
                                );
                            }
                        },
                    );
                },
                initial,
                1,
            ),
            last(),
        ) as Observable<T>;
    }

    protected _setCurrentBookmark<T extends BookmarkData>(
        bookmark_or_id: Bookmark<T> | string | null,
    ): Observable<Bookmark<T> | null> {
        /** if the bookmark is the same as the current one, do nothing */
        if (bookmark_or_id == this.currentBookmark) {
            return EMPTY;
        }

        /**
         * Creates an observable that emits the bookmark with data, based on the provided bookmark or ID.
         * If the bookmark_or_id is a string, the bookmark needs to be resolved before setting the current bookmark.
         */
        const bookmark$ =
            typeof bookmark_or_id === 'string'
                ? this._fetchBookmarkById(bookmark_or_id)
                : of(bookmark_or_id as Bookmark);

        const notify$ = bookmark$.pipe(
            withLatestFrom(this.currentBookmark$),
            switchMap(([next, current]) => {
                return from(
                    this._dispatchEvent('onCurrentBookmarkChange', { detail: { current, next } }),
                ).pipe(
                    map(({ canceled }): Bookmark<T> | null => {
                        if (canceled) {
                            const error = new BookmarkProviderError(
                                `event: onCurrentBookmarkChange was canceled by listener for change to ${next?.id ?? 'none'}, from ${current?.id ?? 'none'}`,
                            );
                            this._log?.info(error.message);
                            throw error;
                        }
                        return next as Bookmark<T> | null;
                    }),
                );
            }),
        );
        return notify$.pipe(
            tap((bookmark) => this.#store.execute.setCurrentBookmark(bookmark as Bookmark)),
        );
    }

    /**
     * Fetches a bookmark by its ID and returns an observable that emits the bookmark with data.
     */
    protected _fetchBookmarkById = <T extends BookmarkData>(
        bookmarkId: string,
    ): Observable<Bookmark<T> | null> => {
        return forkJoin({
            bookmark: this.#store.client.getBookmarkById(bookmarkId),
            payload: this.#store.client.getBookmarkData(bookmarkId),
        }).pipe(
            tap(({ bookmark }) => {
                /** update the bookmark in the store */
                this.#store.execute.setBookmark(bookmark);
            }),
            map(({ bookmark, payload }) => {
                if (bookmark) {
                    return {
                        ...bookmark,
                        payload,
                    } as Bookmark<T>;
                }
                return null;
            }),
            tap((bookmark) => {
                bookmark
                    ? this._log?.debug(`fetched bookmark ${bookmarkId}`)
                    : this._log?.warn(`bookmark ${bookmarkId} not found`);
            }),
            tap((bookmark) => {
                /** if the resolved bookmark is the same as the current one, update the current bookmark */
                if (this.currentBookmark?.id === bookmark?.id) {
                    this.#store.execute.setCurrentBookmark(bookmark as Bookmark);
                }
            }),
        );
    };

    /**
     * Creates a new bookmark with the provided data, application context, and user context.
     *
     * @template T - The type of data associated with the bookmark.
     * @param newBookmark - The new bookmark data to be created.
     * @returns An observable that emits the created bookmark with its associated data.
     */
    protected _createBookmark<T extends BookmarkData>(
        newBookmark: BookmarkNew<T>,
    ): Observable<Bookmark<T>> {
        /**
         * Generates a unique identifier for the request to create a bookmark.
         */
        const ref = generateGUID();

        this._log?.info(`creating new bookmark, ref: ${ref}`);

        /**
         * Filters the store's action stream to only include actions with the scope of this function
         */
        const action$ = this.#store.action$.pipe(
            filter((action) => 'meta' in action && action.meta?.ref === ref),
        );

        /**
         * Emits a `BookmarkWithData<T>` object when a successful `createBookmark` action is dispatched.
         */
        const success$ = action$.pipe(
            filter(bookmarkActions.createBookmark.success.match),
            map(({ payload }) => payload as Bookmark<T>),
            tap((newBookmark) =>
                this._log?.info(`new bookmark created: ${newBookmark.id}, ref: ${ref}`),
            ),
        );

        /**
         * Handles errors that occur when creating a bookmark.
         *
         * This code sets up an observable stream that listens for `bookmarkActions.createBookmark.failure` actions.
         * When a failure action is detected, it filters the action to only those that match the provided `ref` reference,
         * and then maps the payload of the action to create a `BookmarkProviderError` instance with the appropriate error message and cause.
         */
        const failure$ = action$.pipe(
            filter(bookmarkActions.createBookmark.failure.match),
            map(({ payload: cause }) => {
                const error = new BookmarkProviderError(`Failed to create bookmark: ${ref}`, {
                    cause,
                });
                this._log?.info(error.message);
                throw error;
            }),
        );

        /**
         * Combines multiple observables to create a new bookmark.
         *
         * The `data$` observable combines the following:
         * - `app`: Resolves the current application context.
         * - `context`: Resolves the current user context.
         * - `data`: Provides the data for the new bookmark.
         *
         * This allows the bookmark creation process to access relevant application and user context, which can be used to customize the bookmark before it is created.
         *
         * Note: There is a TODO comment to allow registering `onCreateBookmark` listeners to further modify the bookmark before it is created.
         */
        const data$ = forkJoin({
            app: from(this._resolve.application()),
            context: from(this._resolve.context()),
            payload: this._generatePayload<T>(newBookmark.payload),
        });

        /**
         * Handles the creation of a new bookmark.
         *
         * 1. Creates a new bookmark object with the provided data, app key, and context ID.
         * 2. Dispatches an 'onBookmarkCreate' event, allowing listeners to cancel the bookmark creation.
         * 3. If the event is not canceled, creates the bookmark in the store.
         * 4. Returns an observable that emits the success or failure of the bookmark creation.
         */
        const request$ = data$.pipe(
            concatMap(async ({ app, context, payload }) => {
                if (app?.appKey === undefined) {
                    throw new BookmarkProviderError(
                        'Can not create bookmark since failure to resolve application key',
                    );
                }
                const bookmark: BookmarkNew<T> = {
                    ...newBookmark,
                    payload: payload ?? undefined,
                    appKey: app.appKey,
                    contextId: context?.id,
                    sourceSystem: this.sourceSystem,
                };
                const { canceled } = await this._dispatchEvent('onBookmarkCreate', {
                    detail: bookmark,
                    cancelable: true,
                });
                if (canceled) {
                    const error = new BookmarkProviderError(
                        `event: onBookmarkCreate was canceled by listener for creating bookmark: ${ref}`,
                    );
                    this._log?.info(error.message);
                    throw error;
                }
                this.#store.execute.createBookmark(bookmark, { ref });
            }),
            concatMap(() => merge(success$, failure$)),
            tap((newBookmark) => {
                this._dispatchEvent('onBookmarkCreated', { detail: newBookmark as Bookmark });
            }),
        );

        return request$;
    }

    /**
     * Updates a bookmark in the store and emits a success or failure event.
     *
     * 1. Dispatches an event to notify listeners that the bookmark will be updated.
     * 2. If the event is not canceled, updates the bookmark in the store.
     * 3. Merges the success and failure observables to handle the update result.
     *
     * @param bookmarkUpdates - The latest bookmark updates object, which contains the updated data.
     * @returns An observable stream that emits the latest bookmark updates with the updated data.
     */
    protected _updateBookmark<T extends BookmarkData>(
        bookmarkId: string,
        bookmarkUpdates?: BookmarkUpdate<T>,
        options?: BookmarkUpdateOptions,
    ): Observable<Bookmark<T>> {
        /**
         * Generates a unique identifier for the request to update a bookmark.
         */
        const ref = generateGUID();

        this._log?.info(`Updating bookmark: ${bookmarkId}, ref: ${ref}`);

        /**
         * Filters the store's action stream to only include actions with the scope of this function
         */
        const action$ = this.#store.action$.pipe(
            filter((action) => 'meta' in action && action.meta?.ref === ref),
        );

        /**
         * Handles the failure case when updating a bookmark.
         *
         * This stream emits an error when the `updateBookmark` action fails. The error includes the cause of the failure.
         */
        const failure$ = action$.pipe(
            filter(bookmarkActions.updateBookmark.failure.match),
            map(({ payload: cause }) => {
                const error = new BookmarkProviderError(
                    `Failed to update bookmark: ${bookmarkId}`,
                    {
                        cause,
                    },
                );
                this._log?.info(error.message);
                throw error;
            }),
        );

        /**
         * Emits the successful update of a bookmark.
         */
        const success$ = action$.pipe(
            filter(bookmarkActions.updateBookmark.success.match),
            tap(() => this._log?.info(`Bookmark updated: ${bookmarkId}, ref: ${ref}`)),
            map(
                /** merges the updated bookmark with the updated data */
                ({ payload }): Bookmark<T> =>
                    ({
                        ...bookmarkSelector(this.#store.value, payload.id),
                        payload: payload.payload,
                    }) as Bookmark<T>,
            ),
        );

        /**
         * Generates the payload for updating a bookmark.
         *
         * If `options?.excludePayloadGeneration` is true, the existing `bookmarkUpdates.payload` is used directly.
         * Otherwise, the `_generatePayload` method is called to generate the payload, and the resulting payload is merged with the existing `bookmarkUpdates` object.
         */
        const bookmark$ = options?.excludePayloadGeneration
            ? of(bookmarkUpdates ?? {})
            : from(this._generatePayload<T>(bookmarkUpdates?.payload)).pipe(
                  map((payload) => ({
                      ...bookmarkUpdates,
                      payload,
                  })),
              );

        /**
         * Updates a bookmark in the store and emits a success or failure event.
         *
         *  - Notifies listeners that the bookmark will be updated.
         *  - If the event is not canceled, dispatches an action to update the bookmark in the store.
         *  - Merges the success and failure observables to handle the update result.
         */
        const update$ = bookmark$.pipe(
            concatMap((updates) =>
                this._dispatchEvent('onBookmarkUpdate', {
                    detail: {
                        current: bookmarkSelector(this.#store.value, bookmarkId),
                        updates,
                    },
                    cancelable: true,
                }),
            ),
            map(({ canceled, type, detail }) => {
                if (canceled) {
                    const error = new BookmarkProviderError(
                        `event: ${type} was canceled by listener for updating bookmark: ${bookmarkId}, ref: ${ref}`,
                    );
                    this._log?.info(error.message);
                    throw error;
                }
                this.#store.execute.updateBookmark(detail, { ref });
            }),
            concatMap(() => merge(success$, failure$)),
            tap((bookmark) => {
                this._dispatchEvent('onBookmarkUpdated', { detail: bookmark as Bookmark });
            }),
        );

        return update$;
    }

    /**
     * Removes a bookmark from the store and emits a success or failure event.
     *
     * 1. Dispatches an event to notify listeners that the bookmark will be removed.
     * 2. If the event is not canceled, removes the bookmark from the store.
     * 3. Merges the success and failure observables to handle the removal result.
     *
     * @param bookmarkId - The ID of the bookmark to be removed.
     * @returns An observable that emits either 'delete_bookmark' or 'remove_bookmark_favourite' upon successful removal, or throws a `BookmarkProviderError` upon failure.
     */
    protected _removeBookmark(
        bookmarkId: string,
    ): Observable<'delete_bookmark' | 'remove_favourite_bookmark'> {
        /**
         * Generates a unique identifier for the request to update a bookmark.
         */
        const ref = generateGUID();

        this._log?.info(`Removing bookmark: ${bookmarkId}, ref: ${ref}`);

        /**
         * Filters the store's action stream to only include actions with the scope of this function
         */
        const action$ = this.#store.action$.pipe(
            filter((action) => 'meta' in action && action.meta?.ref === ref),
        );

        /**
         * Handles the failure case when removing a bookmark.
         *
         * This stream emits an error when the `updateBookmark` action fails. The error includes the cause of the failure.
         */
        const failure$ = action$.pipe(
            filter(bookmarkActions.removeBookmark.failure.match),
            map(({ payload: cause }) => {
                const error = new BookmarkProviderError(
                    `Failed to update bookmark: ${bookmarkId}`,
                    {
                        cause,
                    },
                );
                this._log?.info(error.message);
                throw error;
            }),
        );

        /**
         * Emits the successful removal of a bookmark.
         */
        const success$ = action$.pipe(
            filter(bookmarkActions.removeBookmark.success.match),
            map(({ payload }) => payload.type),
            tap((type) =>
                this._log?.info(`Removed bookmark: ${bookmarkId}, type: ${type} ref: ${ref}`),
            ),
        );

        /**
         * Removes a bookmark from the store and emits a success or failure event.
         *
         * 1. Dispatches event for notifying listeners that the bookmark will be removed.
         * 2. If the event is not canceled, removes the bookmark from the store.
         * 3. Merges the success and failure observables to handle the removal result.
         */
        const remove$ = from(
            this._dispatchEvent('onBookmarkRemove', {
                detail: bookmarkId,
                cancelable: true,
            }),
        ).pipe(
            concatMap(({ canceled }) => {
                if (canceled) {
                    const error = new BookmarkProviderError(
                        `event: onBookmarkRemove was canceled by listener for removing bookmark: ${bookmarkId}, ref: ${ref}`,
                    );
                    this._log?.info(error.message);
                    throw error;
                }
                this.#store.execute.removeBookmark(bookmarkId);
                return merge(success$, failure$);
            }),
            tap((type) => {
                this._dispatchEvent('onBookmarkRemoved', { detail: { type, bookmarkId } });
            }),
        );

        return remove$;
    }

    /**
     * Adds a bookmark to the user's favorites.
     *
     * In the success case, it requests the bookmark by the provided ID and emits the updated bookmark.
     * In the failure case, it throws a `BookmarkProviderError` with the cause of the failure.
     *
     * @param bookmarkId - The ID of the bookmark to add to the user's favorites.
     * @returns An observable that emits the updated bookmark on success, or throws an error on failure.
     */
    protected _addBookmarkToFavorites(bookmarkId: string): Observable<Bookmark | null> {
        /**
         * Generates a unique identifier for the operation.
         */
        const ref = generateGUID();

        this._log?.info(`Adding bookmark: ${bookmarkId} to favourites, ref: ${ref}`);

        /**
         * Filters actions to operation scope
         */
        const action$ = this.#store.action$.pipe(
            filter((action) => 'meta' in action && action.meta?.ref === ref),
        );

        /**
         * Handles the failure case when adding a bookmark to the user's favorites.
         * This stream emits an error with the cause of the failure, which can be used for error handling and logging.
         */
        const failure$ = action$.pipe(
            filter(bookmarkActions.addBookmarkAsFavourite.failure.match),
            map(({ payload: cause }) => {
                const error = new BookmarkProviderError(
                    `Failed to add bookmark to favorites: ${bookmarkId}`,
                    { cause },
                );
                this._log?.info(error.message);
                throw error;
            }),
        );

        /**
         * Handles the success case of adding a bookmark as a favorite.
         *
         * This code sets up a stream that listens for the success action of adding a bookmark as a favorite.
         * When the action is successful, it request the bookmark by the provided id.
         */
        const success$ = action$.pipe(
            filter(bookmarkActions.addBookmarkAsFavourite.success.match),
            tap(() => this._log?.info(`Added bookmark: ${bookmarkId} to favourites, ref: ${ref}`)),
            switchMap(({ payload }) => this._fetchBookmarkById(payload)),
        );

        /**
         * Dispatches an event to notify listeners that a bookmark is about to be added as favourite.
         */
        const flow$ = from(
            this._dispatchEvent('onBookmarkFavouriteAdd', {
                detail: {
                    bookmarkId,
                },
                cancelable: true,
            }),
        ).pipe(
            concatMap(({ canceled, type }) => {
                if (canceled) {
                    const error = new BookmarkProviderError(
                        `event: ${type} was canceled by listener for adding favourite bookmark: ${bookmarkId}, ref: ${ref}`,
                    );
                    this._log?.info(error.message);
                    throw error;
                }
                this.#store.execute.addBookmarkAsFavourite(bookmarkId);
                return merge(success$, failure$);
            }),
            tap((bookmark) => {
                this._dispatchEvent('onBookmarkFavouriteAdded', { detail: { bookmark } });
            }),
        );

        return flow$;
    }

    /**
     * Checks if the specified bookmark is a favorite.
     * @param bookmarkId - The ID of the bookmark to check.
     * @returns An observable that emits a boolean indicating whether the bookmark is a favorite or not.
     */
    protected _isBookmarkInFavorites(bookmarkId: string): Observable<boolean> {
        this._log?.info(`Checking if bookmark: ${bookmarkId} is in favourites`);

        /**
         * Checks if the specified bookmark is a favorite.
         */
        const check$ = from(this.client.isBookmarkFavorite(bookmarkId)).pipe(
            tap((isFavorite) => {
                this._log?.info(
                    `Bookmark: ${bookmarkId} is ${isFavorite ? 'in' : 'not in'} favourites`,
                );
            }),
        );

        return check$;
    }

    dispose(): void {
        this._log?.info('disposing BookmarkProvider');
        this.#subscriptions.unsubscribe();
    }
}
