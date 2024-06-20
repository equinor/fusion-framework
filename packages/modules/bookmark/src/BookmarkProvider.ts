import {
    EMPTY,
    Observable,
    Subscription,
    concatMap,
    filter,
    forkJoin,
    from,
    lastValueFrom,
    map,
    merge,
    of,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs';

import { v4 as generateGUID } from 'uuid';

import {
    FrameworkEvent,
    FrameworkEventInitType,
    IEventModuleProvider,
    IFrameworkEvent,
} from '@equinor/fusion-framework-module-event';

import { isFailureAction } from '@equinor/fusion-observable';

import { type ILogger } from '@equinor/fusion-log';

import type { Bookmark, BookmarkData, BookmarkWithoutData } from './types';

import { BookmarkNew, BookmarkUpdate, type IBookmarkClient } from './BookmarkClient.interface';
import { type BookmarkModuleConfig } from './BookmarkConfigurator';
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
import { SemanticVersion } from '@equinor/fusion-framework-module';

/**
 * The `BookmarkProvider` class is responsible for managing bookmarks in the application.
 * It provides methods for creating, updating, and removing bookmarks, as well as managing the current bookmark and the list of bookmarks.
 *
 * The `BookmarkProvider` uses a `BookmarkStore` to manage the state of the bookmarks, and an `IBookmarkClient` to interact with the backend API.
 *
 * The `BookmarkProvider` also supports event listeners for various bookmark-related events, such as when the current bookmark changes or when a bookmark is created, updated, or removed.
 */
export class BookmarkProvider {
    // #client: IBookmarkClient;

    #store: BookmarkStore;

    #event?: IEventModuleProvider;

    #log?: ILogger;

    #subscriptions = new Subscription();

    /**
     * Gets the semantic version of the bookmark provider.
     * @returns The semantic version of the bookmark provider.
     */
    get version(): SemanticVersion {
        return new SemanticVersion(version);
    }

    /**
     * Gets the `IBookmarkClient` instance used by this `BookmarkProvider`.
     *
     * @returns The `IBookmarkClient` instance used by this `BookmarkProvider`.
     */
    get client(): IBookmarkClient {
        return this.#store.client;
    }

    /**
     * Gets the currently active bookmark.
     *
     * @returns An observable that emits the currently active bookmark, or `null` or `undefined` if there is no active bookmark.
     */
    get currentBookmark$(): Observable<Bookmark | null> {
        return this.#store.select(activeBookmarkSelector);
    }

    /**
     * Gets an observable that emits the current list of bookmarks.
     *
     * @returns An observable that emits the current list of bookmarks.
     */
    get bookmarks$(): Observable<Array<BookmarkWithoutData>> {
        this.#store.execute.fetchBookmarks();
        // TODO - add deep diff
        return this.#store.select(bookmarksSelector);
    }

    /**
     * Gets the currently active bookmark.
     *
     * @returns An observable that emits the currently active bookmark, or `null` or `undefined` if there is no active bookmark.
     */
    get currentBookmark(): Bookmark | null | undefined {
        return activeBookmarkSelector(this.#store.value);
    }

    /**
     * Gets an observable that emits the current list of bookmark errors.
     *
     * @returns An observable that emits the current list of bookmark errors.
     */
    get errors$(): Observable<Array<BookmarkFlowError>> {
        // TODO - add deep diff
        return this.#store.select(errorsSelector);
    }

    protected _resolveApplication: BookmarkModuleConfig['resolveApplication'];
    protected _resolveContext: BookmarkModuleConfig['resolveContext'];

    /**
     * Constructs a new `BookmarkProvider` instance.
     *
     * @param args - An object containing the configuration and event provider for the bookmark module.
     * @param args.config - The configuration for the bookmark module.
     * @param args.event - An optional event provider for the bookmark module.
     */
    constructor(config: BookmarkModuleConfig) {
        this._resolveApplication = config.resolveApplication;
        this._resolveContext = config.resolveContext;

        const parent = config.parent;

        // this.#sourceSystem = args.config.sourceSystem;
        this.#event = config.eventProvider;

        this.#log = config.log;

        this.#store = createBookmarkStore({
            client: config.client,
            initial: { currentBookmark: parent?.currentBookmark ?? null },
        });

        /** closed store on dispose */
        this.#subscriptions.add(() => this.#store.complete());

        /** Add logging for dispatched actions */
        this.#subscriptions.add(
            this.#store.action$.subscribe((action) => {
                if (isFailureAction(action)) {
                    this.#log?.error(`Action: ${action.type}`, action);
                } else {
                    this.#log?.debug(`Action: ${action.type}`, action);
                }
            }),
        );

        /** Notify when current bookmark is changed */
        this.#subscriptions.add(
            this.#store.select(activeBookmarkSelector).subscribe((bookmark) => {
                this._dispatchEvent('onCurrentBookmarkChanged', { detail: bookmark });
            }),
        );

        if (parent) {
            try {
                this.#subscriptions.add(
                    parent.currentBookmark$.subscribe((bookmark) => {
                        this.setCurrentBookmark(bookmark);
                    }),
                );
            } catch (e) {
                this.#log?.error('Failed to subscribe to parent bookmark provider', e);
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
        eventName: keyof BookmarkProviderEventMap,
        callback: (event: BookmarkProviderEventMap[TType]) => void,
    ): VoidFunction {
        if (!this.#event) {
            console.warn('BookmarkProvider: event provider not configured');
            return () => {};
        }
        return this.#event?.addEventListener(eventName, callback);
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
        bookmarkUpdates: BookmarkUpdate<T>,
    ): Observable<Bookmark<T>> {
        return this._updateBookmark<T>(bookmarkId, bookmarkUpdates);
    }

    /**
     * Updates a bookmark asynchronously.
     *
     * @param bookmark - The bookmark to update.
     * @returns A promise that resolves to the updated bookmark with its associated data.
     */
    public updateBookmarkAsync<T extends BookmarkData>(
        bookmarkId: string,
        bookmarkUpdates: BookmarkUpdate<T>,
    ): Promise<Bookmark<T>> {
        return lastValueFrom(this.updateBookmark<T>(bookmarkId, bookmarkUpdates));
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
        if (this.#event) {
            this.#log?.debug(`dispatching event ${type}`, args);
            const { canceled } = await this.#event.dispatchEvent(event);
            if (canceled) {
                this.#log?.debug(`event ${type} was canceled`, args);
            }
        }
        return event;
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
                            this.#log?.info(error.message);
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
                    ? this.#log?.debug(`fetched bookmark ${bookmarkId}`)
                    : this.#log?.warn(`bookmark ${bookmarkId} not found`);
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

        this.#log?.info(`creating new bookmark, ref: ${ref}`);

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
                this.#log?.info(`new bookmark created: ${newBookmark.id}, ref: ${ref}`),
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
                this.#log?.info(error.message);
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
            app: from(this._resolveApplication()),
            context: from(this._resolveContext()),
            // TODO: allow registering onCreateBookmark listeners to modify the bookmark before it is created
            payload: of(newBookmark.payload),
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
                    payload,
                    appKey: app.appKey,
                    contextId: context?.id,
                    // TODO: get source system from config
                    // sourceSystem: this._sourceSystem
                };
                const { canceled } = await this._dispatchEvent('onBookmarkCreate', {
                    detail: bookmark,
                    cancelable: true,
                });
                if (canceled) {
                    const error = new BookmarkProviderError(
                        `event: onBookmarkCreate was canceled by listener for creating bookmark: ${ref}`,
                    );
                    this.#log?.info(error.message);
                    throw error;
                }
                this.#store.execute.createBookmark(bookmark, { ref });
            }),
            concatMap(() => merge(success$, failure$)),
            tap((bookmark) => {
                this._dispatchEvent('onBookmarkCreated', { detail: bookmark as Bookmark });
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
        bookmarkUpdates: BookmarkUpdate<T>,
    ): Observable<Bookmark<T>> {
        /**
         * Generates a unique identifier for the request to update a bookmark.
         */
        const ref = generateGUID();

        this.#log?.info(`Updating bookmark: ${bookmarkId}, ref: ${ref}`);

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
                this.#log?.info(error.message);
                throw error;
            }),
        );

        /**
         * Emits the successful update of a bookmark.
         */
        const success$ = action$.pipe(
            filter(bookmarkActions.updateBookmark.success.match),
            tap(() => this.#log?.info(`Bookmark updated: ${bookmarkId}, ref: ${ref}`)),
            map(
                /** merges the updated bookmark with the updated data */
                ({ payload }): Bookmark<T> =>
                    ({
                        ...bookmarkSelector(this.#store.value, payload.id),
                        payload: bookmarkUpdates.payload,
                    }) as Bookmark<T>,
            ),
        );

        const update$ = from(
            this._dispatchEvent('onBookmarkUpdate', {
                detail: {
                    current: bookmarkSelector(this.#store.value, bookmarkId),
                    updates: bookmarkUpdates,
                },
                cancelable: true,
            }),
        ).pipe(
            map(({ canceled, type }) => {
                if (canceled) {
                    const error = new BookmarkProviderError(
                        `event: ${type} was canceled by listener for updating bookmark: ${bookmarkId}, ref: ${ref}`,
                    );
                    this.#log?.info(error.message);
                    throw error;
                }
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

        this.#log?.info(`Removing bookmark: ${bookmarkId}, ref: ${ref}`);

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
                this.#log?.info(error.message);
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
                this.#log?.info(`Removed bookmark: ${bookmarkId}, type: ${type} ref: ${ref}`),
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
                    this.#log?.info(error.message);
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

        this.#log?.info(`Adding bookmark: ${bookmarkId} to favourites, ref: ${ref}`);

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
                this.#log?.info(error.message);
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
            tap(() => this.#log?.info(`Added bookmark: ${bookmarkId} to favourites, ref: ${ref}`)),
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
                    this.#log?.info(error.message);
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
        this.#log?.info(`Checking if bookmark: ${bookmarkId} is in favourites`);

        /**
         * Checks if the specified bookmark is a favorite.
         */
        const check$ = from(this.client.isBookmarkFavorite(bookmarkId)).pipe(
            tap((isFavorite) => {
                this.#log?.info(
                    `Bookmark: ${bookmarkId} is ${isFavorite ? 'in' : 'not in'} favourites`,
                );
            }),
        );

        return check$;
    }

    dispose(): void {
        this.#log?.info('disposing BookmarkProvider');
        this.#subscriptions.unsubscribe();
    }
}
