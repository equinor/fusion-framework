import {
    BehaviorSubject,
    EMPTY,
    Observable,
    Subscription,
    catchError,
    distinct,
    filter,
    from,
    lastValueFrom,
    shareReplay,
} from 'rxjs';

import {
    FrameworkEvent,
    FrameworkEventInit,
    FrameworkEventInitType,
    IEventModuleProvider,
    IFrameworkEvent,
} from '@equinor/fusion-framework-module-event';

import { Bookmark, NewBookmark, PatchBookmark } from './types';

import { IBookmarkClient } from './BookmarkClient.interface';
import { BookmarkModuleConfig } from './BookmarkConfigurator';
import { ILogger } from '../../../utils/log/src';

class BookmarkProviderError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'BookmarkProviderError';
    }
}

export class BookmarkProvider {
    #client: IBookmarkClient;

    #event?: IEventModuleProvider;

    #log?: ILogger;

    // Subject for storing the current selected bookmark
    // Current selected bookmark can be directly accessed threw the subject state or subscribed for changes
    // When instance create the value is `undefined` to indicate that no bookmark is selected
    // When a bookmark is selected the value is the bookmark object
    // When a bookmark is cleared the value is `null` to indicate that no bookmark is selected
    #currentBookmark$ = new BehaviorSubject<Bookmark<unknown> | undefined | null>(undefined);

    #bookmarks$ = new BehaviorSubject<Bookmark<unknown>[]>([]);
    // #sourceSystem?: SourceSystem;

    // #state: FlowState<State, ActionBuilder>;

    #subscriptions = new Subscription();

    /**
     * Gets the current bookmark
     */
    get currentBookmark(): Bookmark<unknown> | undefined | null {
        return this.#currentBookmark$.value;
    }

    /**
     * Gets the current bookmark as an observable
     */
    get currentBookmark$(): Observable<Bookmark<unknown> | undefined | null> {
        return this.#currentBookmark$.asObservable();
    }

    /**
     * Returns an observable that emits the list of bookmarks.
     * @returns {Observable<Array<Bookmark<unknown>>>} An observable that emits the list of bookmarks.
     */
    get bookmarks$(): Observable<Array<Bookmark<unknown>>> {
        return new Observable((observer) => {
            const update = () =>
                // fetch bookmarks
                from(this.#client.getAllBookmarks())
                    .pipe(
                        // ignore errors
                        catchError((error: Error) => {
                            this.#log?.error('Failed to fetch bookmarks', error);
                            return EMPTY;
                        }),
                    )
                    // update observer with bookmarks
                    .subscribe((bookmarks) => {
                        observer.next(bookmarks);
                    });

            // subscribe to bookmark changes
            observer.add(this.on('onBookmarkCreated', update));
            observer.add(this.on('onBookmarkUpdated', update));

            // fetch initial bookmarks
            update();
        });
    }

    get client(): IBookmarkClient {
        return this.#client;
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

        // Subscribe to the current bookmark observable
        this.#subscriptions.add(
            this.#currentBookmark$
                // Emit only when the bookmark changes
                .pipe(distinct())
                .subscribe((bookmark) => {
                    // Log the current bookmark change
                    this.#log?.debug('Current bookmark changed', bookmark);
                    if (this.#event) {
                        // Dispatch event with bookmark details
                        this.#event!.dispatchEvent('onCurrentBookmarkChanged', {
                            detail: bookmark,
                        });
                    }
                }),
        );

        const bookmarks$ = new Observable((observer) => {
            const update = () =>
                // fetch bookmarks
                from(this.#client.getAllBookmarks())
                    .pipe(
                        // ignore errors
                        catchError((error: Error) => {
                            this.#log?.error('Failed to fetch bookmarks', error);
                            return EMPTY;
                        }),
                    )
                    // update observer with bookmarks
                    .subscribe((bookmarks) => {
                        observer.next(bookmarks);
                    });
            // subscribe to bookmark changes
            observer.add(this.on('onBookmarkCreated', update));
            observer.add(this.on('onBookmarkUpdated', update));

            // fetch initial bookmarks
            update();
        }).pipe(shareReplay(1));
    }

    protected async _dispatchEvent<TType extends keyof BookmarkProviderEventMap>(
        type: TType,
        args: FrameworkEventInitType<BookmarkProviderEventMap[NoInfer<TType>]>,
    ): Promise<IFrameworkEvent> {
        const event = new FrameworkEvent(type, { source: this, canBubble: true, ...args });
        if (this.#event) {
            this.#log?.debug('dispatching event', type, args);
            const result = await this.#event.dispatchEvent(event);
            if (result.canceled) {
                this.#log?.debug('BookmarkProvider: dispatchEvent canceled', type, args);
            }
            return result;
        }
        return event;
    }

    protected updateBookmarks(): Promise<void> {
        const bookmark$ = from(this.#client.getAllBookmarks()).pipe(
            // ignore errors
            catchError((error: Error) => {
                this.#log?.error('Failed to fetch bookmarks', error);
                return EMPTY;
            }),
        );
    }

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
     * Sets the current bookmark asynchronously.
     * Dispatches an 'onCurrentBookmarkChange' event with the new bookmark details.
     * If the event is canceled by any listener, a BookmarkProviderError is thrown.
     * Updates the current bookmark observable with the new bookmark.
     *
     * @param {Bookmark | null} bookmark - The new bookmark to set, or null to clear the current bookmark.
     * @returns {Promise<void>} A promise that resolves when the bookmark is set.
     * @throws {BookmarkProviderError} If the bookmark change is canceled by an event listener.
     */
    public async setCurrentBookmarkAsync(bookmark: Bookmark | null): Promise<void> {
        this.#log?.debug('requesting to set current bookmark', bookmark);
        const event = await this._dispatchEvent('onCurrentBookmarkChange', {
            detail: bookmark, // Pass the bookmark detail to the event
            cancelable: true, // Allow the event to be cancelable
        });
        if (event.canceled) {
            this.#log?.debug('setting of current bookmark was canceled', bookmark);
            // throw error if the event is canceled
            throw new BookmarkProviderError(
                'Current bookmark change was canceled by event listener of [onCurrentBookmarkChange]',
            );
        }
        this.#currentBookmark$.next(bookmark); // Update the current bookmark observable with the new bookmark
    }

    /**
     * Clears the current bookmark by setting it to null.
     *
     * This method asynchronously sets the current bookmark to null,
     * effectively clearing any existing bookmark.
     *
     * @returns {Promise<void>} A promise that resolves when the bookmark is cleared.
     */
    public async clearCurrentBookmarkAsync(): Promise<void> {
        // Clear the current bookmark by setting it to null
        await this.setCurrentBookmarkAsync(null);
        this.#log?.debug('current bookmark cleared');
    }

    /**
     * Sets the current bookmark by its ID.
     *
     * @param id - The ID of the bookmark to set as the current bookmark.
     * @returns A Promise that resolves when the current bookmark is set.
     * @throws {BookmarkProviderError} If there is an error setting the current bookmark by ID.
     */
    public async setCurrentBookmarkByIdAsync(id: string): Promise<void> {
        try {
            this.#log?.debug(`trying to resolve bookmark by id: [${id}]`);
            // Get the bookmark by ID from the client
            // Await the observable to complete and get the last emitted value
            const bookmark = await lastValueFrom(from(this.#client.getBookmarkById(id)));

            this.#log?.debug(`bookmark resolved from id: [${id}]`, bookmark);
            // Update the current bookmark state with the fetched bookmark
            return this.setCurrentBookmarkAsync(bookmark);
        } catch (error) {
            console.error(`failed set bookmark by id: [${id}]`, error);
            // If the error is a BookmarkProviderError, rethrow it
            // Otherwise, create a new BookmarkProviderError with a message and the original error as the cause
            throw error instanceof BookmarkProviderError
                ? error
                : new BookmarkProviderError(`Failed to set current bookmark by ID: ${id}`, {
                      cause: error,
                  });
        }
    }

    /**
     * Creates a new bookmark asynchronously.
     *
     * @template T - The type of the bookmark's data.
     * @param newBookmark - The new bookmark to create, excluding the `appKey` and `contextId` properties.
     * @returns The created bookmark.
     * @throws {BookmarkProviderError} If the bookmark creation is canceled or fails.
     */
    public async createBookmarkAsync<T>(
        newBookmark: Omit<NewBookmark<T>, 'appKey' | 'contextId'>,
    ): Promise<Bookmark<T>> {
        // Resolve the application context
        const app = await this._resolveApplication();

        // Resolve the current context
        const context = await this._resolveContext();

        // Create the new bookmark from resolved application and context
        // spread provided properties into the new bookmark
        const bookmark: NewBookmark<T> = {
            appKey: app?.appKey,
            contextId: context?.id,
            ...newBookmark,
        };

        // Dispatch an event to allow listeners to cancel the bookmark creation
        const event = await this._dispatchEvent('onBookmarkCreate', {
            detail: bookmark, // Provide bookmark details in the event
            cancelable: true, // Allow the event to be cancelable
        });

        // If the event is canceled, throw an error
        if (event.canceled) {
            console.info('creation of bookmark was canceled', bookmark);
            throw new BookmarkProviderError(
                'Bookmark creation was canceled by event listener of [onBookmarkCreate]',
            );
        }
        try {
            // Create the bookmark using the client
            const createdBookmark = await lastValueFrom(
                from(this.#client.createBookmark(bookmark)),
            );
            this.#log?.debug('bookmark created', createdBookmark);
            this._dispatchEvent('onBookmarkCreated', { detail: createdBookmark });

            // Return the created bookmark
            return createdBookmark;
        } catch (error) {
            console.error('failed to create bookmark', error);
            throw new BookmarkProviderError('Failed to create bookmark', { cause: error });
        }
    }

    /**
     * Updates an existing bookmark asynchronously.
     *
     * @param bookmark - The bookmark to update.
     * @returns The updated bookmark.
     */
    public async updateBookmarkAsync<T>(bookmark: PatchBookmark<T>): Promise<Bookmark<T>> {
        // Dispatch an event to allow listeners to cancel the bookmark update
        const event = await this._dispatchEvent('onBookmarkUpdate', {
            detail: bookmark,
            cancelable: true,
        });

        // If the event is canceled, throw an error
        if (event.canceled) {
            console.info('update of bookmark was canceled', bookmark);
            throw new BookmarkProviderError(
                'Update of bookmark was canceled by event listener of [onBookmarkUpdate]',
            );
        }
        try {
            this.#log?.debug(`updating bookmark: [${bookmark.id}]`, bookmark);
            // Await the Observable to complete and retrieve the last emitted value
            const updatedBookmark = await lastValueFrom(
                from(this.#client.updateBookmark<T>(bookmark)),
            );

            // If the updated bookmark matches the current selected bookmark, update it directly
            if (updatedBookmark.id === this.currentBookmark?.id) {
                this.#log?.debug(`updating current bookmark: [${bookmark.id}]`, bookmark);
                // Directly set the value to avoid emitting and potentially cancelling `onBookmarkChange`
                this.#currentBookmark$.next(updatedBookmark);
            }

            // Dispatch an event indicating the bookmark has been updated
            this._dispatchEvent('onBookmarkUpdated', {
                detail: updatedBookmark,
            });

            this.#log?.info(`bookmark updated: [${bookmark.id}]`, bookmark);

            // Return the updated bookmark
            return updatedBookmark;
        } catch (error) {
            this.#log?.error(`failed to update bookmark: [${bookmark.id}]`, error);
            // Throw a custom error with the bookmark ID and original error cause
            throw new BookmarkProviderError(`Failed to update bookmark [${bookmark.id}]`, {
                cause: error, // Preserve the original error cause
            });
        }
    }

    /**
     * Removes a bookmark from the system.
     *
     * @param bookmarkId - The unique identifier of the bookmark to be removed.
     * @returns A Promise that resolves when the bookmark has been successfully deleted.
     * @throws {BookmarkProviderError} If the deletion of the bookmark fails.
     */
    public async removeBookmarkAsync(bookmarkId: string): Promise<void> {
        try {
            this.#log?.debug(`trying to delete bookmark: [${bookmarkId}]`);
            // Request the client to delete the bookmark with the given bookmarkId
            await lastValueFrom(from(this.#client.deleteBookmark(bookmarkId)));

            // Clear the selected bookmark if it matches the deleted bookmarkId
            if (this.currentBookmark?.id === bookmarkId) {
                this.#log?.debug('clearing current bookmark, since it was deleted');
                // Directly set to null to avoid emitting and potentially cancelling `onBookmarkChange`
                this.#currentBookmark$.next(null);
            }
            this.#log?.info(`bookmark deleted: [${bookmarkId}]`);
        } catch (error) {
            this.#log?.error(`failed to delete bookmark: [${bookmarkId}]`, error);
            // Throw a BookmarkProviderError if the deletion fails, including the original error as the cause
            throw new BookmarkProviderError(`Failed to delete bookmark [${bookmarkId}]`, {
                cause: error,
            });
        }
    }

    /**
     * Adds a bookmark to the user's favorites.
     *
     * @param bookmarkId - The ID of the bookmark to add to favorites.
     * @returns `true` if the bookmark was successfully added to favorites, `false` otherwise.
     * @throws {BookmarkProviderError} If there was an error adding the bookmark to favorites.
     */
    public async addBookmarkToFavoritesAsync(bookmarkId: string): Promise<boolean> {
        try {
            this.#log?.debug(`trying to add bookmark [${bookmarkId}] to favorites`);
            // Convert the promise to an observable and await its result
            const result = await lastValueFrom(
                from(this.#client.addBookmarkToFavorites(bookmarkId)),
            );
            this.#log?.info(`bookmark [${bookmarkId}] added to favorites`);
            return result;
        } catch (error) {
            this.#log?.error(`failed to add bookmark [${bookmarkId}] to favorites`, error);
            // Throw a custom error with additional context
            throw new BookmarkProviderError(`Failed to add bookmark [${bookmarkId}] to favorites`, {
                cause: error,
            });
        }
    }

    /**
     * Removes a bookmark from the user's favorites.
     *
     * @param bookmarkId - The ID of the bookmark to remove from favorites.
     * @returns A Promise that resolves to `true` if the bookmark was successfully removed, or `false` otherwise.
     * @throws {BookmarkProviderError} If there was an error removing the bookmark from favorites.
     */
    public async removeBookmarkFromFavoritesAsync(bookmarkId: string): Promise<boolean> {
        try {
            this.#log?.debug(`trying to remove bookmark [${bookmarkId}] from favorites`);
            // Convert the promise to an observable and await its result
            const result = await lastValueFrom(
                from(this.#client.removeBookmarkFromFavorites(bookmarkId)),
            );
            this.#log?.info(`bookmark [${bookmarkId}] removed from favorites`);
            return result;
        } catch (error) {
            this.#log?.error(`failed to remove bookmark [${bookmarkId}] from favorites`, error);
            // Throw a custom error with additional context
            throw new BookmarkProviderError(
                `Failed to remove bookmark [${bookmarkId}] from favorites`,
                {
                    cause: error,
                },
            );
        }
    }

    /**
     * Checks if the specified bookmark is in the user's favorites.
     *
     * @param bookmarkId - The ID of the bookmark to check.
     * @returns A Promise that resolves to a boolean indicating whether the bookmark is in the user's favorites.
     * @throws {BookmarkProviderError} If there was an error checking the bookmark's favorite status.
     */
    public async isBookmarkInFavoritesAsync(bookmarkId: string): Promise<boolean> {
        try {
            this.#log?.debug(`trying to check if bookmark [${bookmarkId}] is in favorites`);
            // Convert the promise to an observable and await its result
            const result = await lastValueFrom(from(this.#client.isBookmarkFavorite(bookmarkId)));
            this.#log?.info(`bookmark [${bookmarkId}] favorite status checked`, result);
            return result;
        } catch (error) {
            this.#log?.error(`failed to check if bookmark [${bookmarkId}] is in favorites`, error);
            throw new BookmarkProviderError(
                `Failed to check if bookmark [${bookmarkId}] is in favorites`,
                {
                    cause: error,
                },
            );
        }
    }

    dispose(): void {
        this.#log?.debug('disposing BookmarkProvider');
        this.#currentBookmark$.complete();
        this.#subscriptions.unsubscribe();
    }
}

interface BookmarkProviderEventMap {
    onCurrentBookmarkChange: IFrameworkEvent<
        FrameworkEventInit<(Pick<Bookmark, 'id'> & Partial<Bookmark>) | null, BookmarkProvider>
    >;
    onCurrentBookmarkChanged: IFrameworkEvent<FrameworkEventInit<Bookmark, BookmarkProvider>>;
    onBookmarkCreate: IFrameworkEvent<FrameworkEventInit<NewBookmark, BookmarkProvider>>;
    onBookmarkCreated: IFrameworkEvent<FrameworkEventInit<Bookmark, BookmarkProvider>>;
    onBookmarkUpdate: IFrameworkEvent<FrameworkEventInit<PatchBookmark, BookmarkProvider>>;
    onBookmarkUpdated: IFrameworkEvent<FrameworkEventInit<Bookmark, BookmarkProvider>>;
}

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap extends BookmarkProviderEventMap {}
}
