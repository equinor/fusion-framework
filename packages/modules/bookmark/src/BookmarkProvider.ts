import {
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

import type { Bookmark, BookmarkData, BookmarkWithData, NewBookmark, PatchBookmark } from './types';

import { type IBookmarkClient } from './BookmarkClient.interface';
import { type BookmarkModuleConfig } from './BookmarkConfigurator';
import { bookmarkActions } from './BookmarkProvider.actions';
import { createBookmarkStore, type BookmarkStore } from './BookmarkProvider.store';
import {
    activeBookmarkSelector,
    bookmarksSelector,
    errorsSelector,
} from './BookmarkProvider.selectors';

import { BookmarkFlowError, BookmarkProviderError } from './BookmarkProvider.error';

import { BookmarkProviderEventMap } from './BookmarkProvider.events';

/**
 * The `BookmarkProvider` class is responsible for managing bookmarks in the application.
 * It provides an interface to interact with bookmarks, including creating, updating, and deleting them.
 * The `BookmarkProvider` also manages the state of bookmarks and provides observables to subscribe to changes.
 */
export class BookmarkProvider {
    #client: IBookmarkClient;

    #store: BookmarkStore;

    #event?: IEventModuleProvider;

    #log?: ILogger;

    #subscriptions = new Subscription();

    /**
     * Gets the `IBookmarkClient` instance used by this `BookmarkProvider`.
     *
     * @returns The `IBookmarkClient` instance used by this `BookmarkProvider`.
     */
    get client(): IBookmarkClient {
        return this.#client;
    }

    /**
     * Gets the currently active bookmark.
     *
     * @returns An observable that emits the currently active bookmark, or `null` or `undefined` if there is no active bookmark.
     */
    get currentBookmark$(): Observable<BookmarkData | null | undefined> {
        return this.#store.select(activeBookmarkSelector);
    }

    /**
     * Gets an observable that emits the current list of bookmarks.
     *
     * @returns An observable that emits the current list of bookmarks.
     */
    get bookmarks$(): Observable<Array<Bookmark>> {
        this.#store.fetchBookmarks();
        // TODO - add deep diff
        return this.#store.select(bookmarksSelector);
    }

    /**
     * Gets the currently active bookmark.
     *
     * @returns An observable that emits the currently active bookmark, or `null` or `undefined` if there is no active bookmark.
     */
    get currentBookmark(): BookmarkData | null | undefined {
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
        this.#client = config.client;

        this._resolveApplication = config.resolveApplication;
        this._resolveContext = config.resolveContext;

        // this.#sourceSystem = args.config.sourceSystem;
        this.#event = config.eventProvider;

        this.#log = config.log;

        this.#store = createBookmarkStore({ client: this.#client });

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

    public getBookmarkById(bookmarkId: string): Observable<Bookmark | null>;
    public getBookmarkById(
        bookmarkId: string,
        includeData: boolean,
    ): Observable<BookmarkWithData | null>;

    /**
     * Retrieves a bookmark by its ID.
     *
     * @param bookmarkId - The ID of the bookmark to retrieve.
     * @param includeData - An optional flag to include the bookmark data in the response.
     * @returns An observable that emits the requested bookmark, or null if not found.
     */
    public getBookmarkById(
        bookmarkId: string,
        includeData?: boolean,
    ): Observable<Bookmark | BookmarkWithData | null> {
        return from(this.#client.getBookmarkById(bookmarkId, includeData));
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
    public setCurrentBookmark(bookmarkId: string): Observable<BookmarkData | null> {
        return this._setCurrentBookmark(bookmarkId);
    }

    /**
     * Sets the current bookmark asynchronously.
     *
     * will reject promise if:
     * - {@link BookmarkProviderEventMap.onCurrentBookmarkChanged} is canceled
     * - a new request for setting the current bookmark is dispatched before the previous request completes
     * - the request fails
     *
     * @param bookmarkId - The ID of the bookmark to set as the current bookmark.
     * @returns A Promise that resolves when the current bookmark has been set.
     */
    public setCurrentBookmarkAsync(bookmarkId: string): Promise<BookmarkData | null> {
        return lastValueFrom(this._setCurrentBookmark(bookmarkId));
    }

    /**
     * Clears the current bookmark.
     * @returns A subscription that can be used to unsubscribe from the bookmark clearing operation.
     */
    public clearCurrentBookmark(): Observable<boolean> {
        return this._clearCurrentBookmark();
    }

    /**
     * Clears the current bookmark asynchronously.
     * @returns A Promise that resolves when the current bookmark has been cleared.
     */
    public async clearCurrentBookmarkAsync(): Promise<void> {
        await lastValueFrom(this._clearCurrentBookmark());
    }

    /**
     * Creates a new bookmark with the provided data.
     *
     * @note the execution of creating a bookmark will not occur until the returned observable is subscribed to.
     * @param bookmark - The new bookmark to create.
     * @returns An observable that emits the created bookmark with its associated data.
     */
    public createBookmark<T>(bookmark: NewBookmark<T>): Observable<BookmarkWithData<T>> {
        return this._createBookmark(bookmark);
    }

    /**
     * Asynchronously creates a new bookmark.
     *
     * @param bookmark - The new bookmark to create.
     * @returns A promise that resolves to the created bookmark with its associated data.
     */
    public createBookmarkAsync<T>(bookmark: NewBookmark<T>): Promise<BookmarkWithData<T>> {
        return lastValueFrom(this._createBookmark(bookmark));
    }

    /**
     * Updates a bookmark with the provided patch.
     *
     * @param bookmark - The bookmark to update, with the changes to apply.
     * @returns An observable that emits the updated bookmark with its data.
     */
    public updateBookmark<T>(bookmark: PatchBookmark<T>): Observable<BookmarkWithData<T>> {
        return this._updateBookmark(bookmark);
    }

    /**
     * Updates a bookmark asynchronously.
     *
     * @param bookmark - The bookmark to update.
     * @returns A promise that resolves to the updated bookmark with its associated data.
     */
    public updateBookmarkAsync<T>(bookmark: PatchBookmark<T>): Promise<BookmarkWithData<T>> {
        return lastValueFrom(this._updateBookmark(bookmark));
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

    /**
     * Sets the current bookmark in the application state.
     *
     * This method dispatches an event to notify listeners of a change in the current bookmark, and then dispatches a request to set the active bookmark in the application state.
     *
     * The method returns an observable that:
     * - Emits the payload of the successful `setActiveBookmark` action when the `bookmarkId` in the action's meta matches the provided `bookmarkId`.
     * - Throws a `BookmarkProviderError` if a new request is made for a different bookmark before the previous request is completed.
     * - Throws a `BookmarkProviderError` if there is a failure in setting the active bookmark.
     *
     * @param bookmarkId - The ID of the bookmark to set as the current bookmark.
     * @throws {BookmarkProviderError} If the {@link BookmarkProviderEventMap.onCurrentBookmarkChange} event is canceled by a listener.
     * @returns An observable that emits the bookmark data when the request to set the bookmark is successful, or throws an error if the request fails or is canceled.
     */
    protected _setCurrentBookmark(bookmarkId: string): Observable<BookmarkData> {
        this.#log?.info(`Setting current bookmark to ${bookmarkId}`);
        /**
         * Emits the payload of the `setActiveBookmark.success` action when the `bookmarkId` in the action's meta matches the provided `bookmarkId`.
         *
         * @param bookmarkId - The ID of the bookmark to listen for.
         * @returns An observable that emits the payload of the successful `setActiveBookmark` action.
         */
        const success$ = this.#store.action$.pipe(
            filter(bookmarkActions.setActiveBookmark.success.match),
            filter((action) => action.meta.ref === bookmarkId),
            map(({ payload }) => payload),
            tap(() => this.#log?.info(`Current bookmark set to ${bookmarkId}`)),
        );

        /**
         * Cancels the request to set the active bookmark when a new request is made for a different bookmark.
         *
         * This observable listens for actions to set the active bookmark, and if the payload (bookmarkId) does not match
         * the current bookmarkId, it throws a `BookmarkProviderError` with a message explaining the cancellation.
         *
         * This allows the application to handle the cancellation of a bookmark set request when a new request is made,
         * preventing potential race conditions or inconsistent state.
         */
        const cancel$ = this.#store.action$.pipe(
            filter(bookmarkActions.setActiveBookmark.match),
            filter((action) => action.payload !== bookmarkId),
            map(({ payload }) => {
                const error = new BookmarkProviderError(
                    `Request for setting bookmark: ${bookmarkId} was canceled, due to new request for ${payload}`,
                );
                this.#log?.info(error.message);
                throw error;
            }),
        );

        /**
         * Handles errors that occur when setting the active bookmark.
         *
         * This code sets up an observable stream that listens for failures in the `setActiveBookmark` action.
         * When a failure occurs, it throws a `BookmarkProviderError` with the bookmark ID and the original error cause.
         * This allows the calling code to handle the error appropriately.
         */
        const failure$ = this.#store.action$.pipe(
            filter(bookmarkActions.setActiveBookmark.failure.match),
            filter((action) => action.meta.ref === bookmarkId),
            map(({ payload: cause }) => {
                const error = new BookmarkProviderError(`Failed to set bookmark: ${bookmarkId}`, {
                    cause,
                });
                this.#log?.info(error.message);
                throw error;
            }),
        );

        /**
         * Dispatches an event to notify listeners of a change in the current bookmark, and then dispatch request for the bookmark to be set.
         * This observable emits bookmark data when the request to set the bookmark is successful.
         * The observable will emit an error if the request to set the bookmark fails.
         * The observable wilt emit an error if a new request is made for a different bookmark before the previous request is completed.
         */
        const request$ = from(
            this._dispatchEvent('onCurrentBookmarkChange', {
                detail: { current: this.currentBookmark, next: { id: bookmarkId } },
                cancelable: true,
            }),
        ).pipe(
            concatMap((event) => {
                if (event.canceled) {
                    const error = new BookmarkProviderError(
                        `event: ${event.type} was canceled by listener for setting bookmark: ${bookmarkId}`,
                    );
                    this.#log?.info(error.message);
                    throw error;
                }
                this.#store.setActiveBookmark(bookmarkId);
                return merge(success$, cancel$, failure$);
            }),
        );

        return request$;
    }

    /**
     * Dispatches an event to notify listeners of a change to the current bookmark, and then clears the active bookmark in the store.
     *
     * If any listener cancels the event, an error is logged and the function throws a `BookmarkProviderError`.
     *
     * @throws {BookmarkProviderError} If the {@link BookmarkProviderEventMap.onCurrentBookmarkChange} event is canceled by a listener.
     * @returns An observable that completes when the current bookmark has been cleared.
     */
    protected _clearCurrentBookmark(): Observable<boolean> {
        this.#log?.info('clearing current bookmark');
        /**
         * Dispatches a 'onCurrentBookmarkChange' event with the current and next bookmark values.
         * The event is cancelable, allowing other parts of the application to prevent the change.
         */
        const notify$ = from(
            this._dispatchEvent('onCurrentBookmarkChange', {
                detail: { current: this.currentBookmark, next: null },
                cancelable: true,
            }),
        );

        /**
         * Clears the current active bookmark if the event is not canceled.
         */
        const clear$ = notify$.pipe(
            map((event) => {
                if (event.canceled) {
                    const error = new BookmarkProviderError(
                        `event: ${event.type} was canceled by listener for clearing current bookmark`,
                    );
                    this.#log?.info(error.message);
                    throw error;
                }
                this.#store.clearActiveBookmark();
                this.#log?.info('current bookmark cleared');
                return true;
            }),
        );
        return clear$;
    }

    /**
     * Creates a new bookmark with the provided data, application context, and user context.
     *
     * @template T - The type of data associated with the bookmark.
     * @param newBookmark - The new bookmark data to be created.
     * @returns An observable that emits the created bookmark with its associated data.
     */
    protected _createBookmark<T>(newBookmark: NewBookmark<T>): Observable<BookmarkWithData<T>> {
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
            map(({ payload }) => payload as BookmarkWithData<T>),
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
            data: of(newBookmark.data),
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
            concatMap(async ({ app, context, data }) => {
                const bookmark: NewBookmark<T> = {
                    ...newBookmark,
                    data,
                    appKey: app?.appKey,
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
                this.#store.createBookmark(bookmark, { ref });
            }),
            concatMap(() => merge(success$, failure$)),
            tap((bookmark) => {
                this._dispatchEvent('onBookmarkCreated', { detail: bookmark });
            }),
        );

        return request$;
    }

    protected _updateBookmark<T>(
        bookmarkUpdates: PatchBookmark<T>,
    ): Observable<BookmarkWithData<T>> {
        /**
         * Generates a unique identifier for the request to update a bookmark.
         */
        const ref = generateGUID();

        this.#log?.info(`Updating bookmark: ${bookmarkUpdates.id}, ref: ${ref}`);

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
                    `Failed to update bookmark: ${bookmarkUpdates.id}`,
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
            tap(() => this.#log?.info(`Bookmark updated: ${bookmarkUpdates.id}, ref: ${ref}`)),
            map(({ payload }) => payload as BookmarkWithData<T>),
        );

        /**
         * Creates an observable stream that emits the latest bookmark updates with the updated data.
         *
         * @todo - setup a callback for aggregate bookmark data
         *
         * @param bookmarkUpdates - The latest bookmark updates object, which contains the updated data.
         * @returns An observable stream that emits the latest bookmark updates with the updated data.
         */
        const data$ = of(bookmarkUpdates.data).pipe(map((data) => ({ ...bookmarkUpdates, data })));

        /**
         * Handles the update of a bookmark in the bookmark store.
         *
         * 1. Dispatches the 'onBookmarkUpdate' event, allowing listeners to cancel the update.
         * 2. If the event is not canceled, updates the bookmark in the store.
         * 3. Merges the success and failure observables to handle the update result.
         */
        const update$ = data$.pipe(
            concatMap(async (bookmark) => {
                const { canceled } = await this._dispatchEvent('onBookmarkUpdate', {
                    detail: bookmark,
                    cancelable: true,
                });
                if (canceled) {
                    const error = new BookmarkProviderError(
                        `event: onBookmarkUpdate was canceled by listener for updating bookmark: ${bookmarkUpdates.id}, ref: ${ref}`,
                    );
                    this.#log?.info(error.message);
                    throw error;
                }
                this.#store.updateBookmark(bookmark, { ref });
            }),
            concatMap(() => merge(success$, failure$)),
            tap((bookmark) => {
                this._dispatchEvent('onBookmarkUpdated', { detail: bookmark });
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
                this.#store.removeBookmark(bookmarkId);
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
            switchMap(({ payload }) => this.getBookmarkById(payload)),
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
                this.#store.addBookmarkAsFavourite(bookmarkId);
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
        const check$ = from(this.#client.isBookmarkFavorite(bookmarkId)).pipe(
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
