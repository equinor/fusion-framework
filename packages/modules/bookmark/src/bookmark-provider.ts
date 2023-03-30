import { ModuleType } from '@equinor/fusion-framework-module';

import {
    EventModule,
    FrameworkEvent,
    FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

import { BookmarkClient } from './client/bookmarkClient';

import { BookmarkModuleConfig } from './configurator';
import { Observable, Subscription } from 'rxjs';
import { Bookmark, CreateBookmark } from './types';

export interface IBookmarkModuleProvider {
    /**
     * @type {BookmarkModuleConfig} Readonly  configuration for the Bookmark Module used as a backdoor enabling bookmark configuration in a sub application.
     */
    readonly config: BookmarkModuleConfig;

    /**
     * Observable Bookmark providing current resolved bookmark.
     * @type {(Observable<Bookmark<any> | undefined>)}
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly currentBookmark$: Observable<Bookmark<any> | undefined>;
    /**
     *
     * Observable list of bookmarks in the current configured system,
     * filtered by the confirmed SourceSystem identifier. This is done by the portal development team;
     * @type {Observable<Array<Bookmark<unknown>>>}
     */
    readonly bookmarks$: Observable<Array<Bookmark<unknown>>>;

    /**
     * The current bookmark available
     * @type {Bookmark<unknown>}
     */
    currentBookmark?: Bookmark<unknown>;

    /**
     * Function fo setting the current applications state creator, is used to collect the state stored in a bookmark.
     * This will enable the bookmark functionality for the application.
     *
     * @template T - Payload Type
     * @param {CreateBookmarkFn<T>} cb - For creating the bookmark payload, this should ne wrapped in a useCallback, payload return can be a partial.
     * @param {keyof T} [key] - User to that property to add partial payload to ,
     * @return {*}  {VoidFunction} - Return a cleanup function for removing the stateCreator.
     */
    addStateCreator<T>(cb: CreateBookmarkFn<T>, key?: keyof T): VoidFunction;

    /**
     * Function for resolving a bookmark form api client
     * @template T - Bookmark Payload type.
     * @param {string} bookmarkId - bookmark indemnificator.
     * @returns {Promise<Bookmark<T>>}
     */
    getBookmarkById<T>(bookmarkId: string): Promise<Bookmark<T>>;

    /**
     * Function for resolving all bookmarks for the current sub system.
     * @return {Observable<Bookmark<T>>} - An observable of the all Bookmarks.
     */
    getAllBookmarks(): Observable<Array<Bookmark>>;

    /**
     * Function for resolving all bookmarks forthe current sub system.
     * @return {Promise<Array<Bookmark<T><>} - Promise of all Bookmarks
     */
    getAllBookmarksAsync(): Promise<Array<Bookmark>>;

    /**
     * Function for updating bookmark a bookmark when successful this will update the bookmark list.
     * @template T - Payload Type
     * @param {string} bookmarkId
     * @param {Bookmark<T>} bookmark
     * @return {Observable<Bookmark<T>>} - An observable of the updated Bookmark.
     */
    updateBookmark<T>(bookmark: Bookmark<T>): Observable<Bookmark<T>>;

    /**
     * Function for updating bookmark a bookmark when successful this will update the bookmark list.
     * @template T - Payload Type
     * @param {string} bookmarkId
     * @param {Bookmark<T>} bookmark
     * @return {Promise<Bookmark<T>>} - Promise of a Bookmark
     */
    updateBookmarkAsync<T>(bookmark: Bookmark<T>): Promise<Bookmark<T>>;

    /**
     * Function for deleting a bookmark, when successful this will update the bookmark list.
     * @param {string} bookmarkId
     * @return {Observable<string>} Observable of the deletes BookmarkId
     */
    deleteBookmarkById(bookmarkId: string): Observable<string>;

    /**
     * Function for deleting a bookmark, when successful this will update the bookmark list.
     * @param {string} bookmarkId
     * @return {Promise<string>} - Promise of the deleted bookmarkId
     */
    deleteBookmarkByIdAsync(bookmarkId: string): Promise<string>;

    /**
     * Function for adding external bookmark to user's bookmarks.
     * @param {string} bookmarkId
     * @return {Promise<string>} void
     */
    addBookmarkFavoriteAsync(bookmarkId: string): Promise<void>;

    /**
     * Function for removing external bookmark to user's bookmarks.
     * @param {string} bookmarkId
     * @return {Promise<void>} - void
     */
    removeBookmarkFavoriteAsync(bookmarkId: string): Promise<void>;

    /**
     * Function for verifying that a bookmark belongs to the current user.
     * @param {string} bookmarkId
     * @return {Promise<string>} - void
     */
    verifyBookmarkFavoriteAsync(bookmarkId: string): Promise<boolean>;

    /**
     * Function for setting the current bookmark, when successful this will update the bookmark list.
     * @template TData - Bookmark payload type.
     * @param {(string | Bookmark<TData> | undefined)} idOrItem - can be full bookmark object or bookmarkId.
     * If not provided the current bookmark state will be set to undefined.
     */
    setCurrentBookmark<TData>(idOrItem?: string | Bookmark<TData>): void;

    /**
     * Creates a new bookmark with the given arguments, and utilizes teh provided stateCreator to create the bookmark payload.
     * @param {{ name: string; description: string; isShared: boolean }} args - Name, Description and isSheared
     */
    createBookmark<T>(args: {
        name: string;
        description: string;
        isShared: boolean;
    }): Promise<Bookmark<T>>;

    /**
     * A parent provider if configuration if application is needed. A backdoor enabling bookmark configuration in a sub application.
     * This is not recommence and may result in unwanted behaviors if not used correctly.
     * @type {IBookmarkModuleProvider}
     */
    parentBookmarkProvider?: IBookmarkModuleProvider;

    /**
     * Record of state creator, is used to collect the state stored in a bookmark.
     * @type {Record<string, CreateBookmarkFn<unknown>>}
     */
    bookmarkCreators: Record<string, CreateBookmarkFn<unknown>>;
}

export type CreateBookmarkFn<T> = () => Promise<Partial<T>> | Partial<T>;

export class BookmarkModuleProvider implements IBookmarkModuleProvider {
    protected _bookmarkClient: BookmarkClient;

    #event?: ModuleType<EventModule>;

    config: BookmarkModuleConfig;
    #subscriptions = new Subscription();

    bookmarkCreators: Record<string | number | symbol, CreateBookmarkFn<unknown>> = {};
    currentBookmark?: Bookmark<unknown>;
    parentBookmarkProvider?: IBookmarkModuleProvider;

    public get currentBookmark$() {
        return this._bookmarkClient.currentBookmark$;
    }

    public get bookmarks$() {
        return this._bookmarkClient.bookmarks$;
    }

    constructor(config: BookmarkModuleConfig, ref?: IBookmarkModuleProvider) {
        this.config = config;
        this.#event = config.event;
        this._bookmarkClient = ref
            ? (ref as unknown as BookmarkModuleProvider)._bookmarkClient
            : new BookmarkClient(config.clientConfiguration, config.sourceSystem, config.event);

        const initialBookmarkId = config.resolveBookmarkId && config.resolveBookmarkId();

        if (initialBookmarkId) {
            this._bookmarkClient.setCurrentBookmark(initialBookmarkId);
        }

        if (this.#event) {
            this.#subscriptions.add(
                this.#event.addEventListener('onCurrentAppChanged', this.#clearStateCreators)
            );
        }
    }

    public async getBookmarkById<T>(bookmarkId: string): Promise<Bookmark<T>> {
        return await this._bookmarkClient.getBookmarkById<T>(bookmarkId);
    }

    public async setCurrentBookmark<TData>(idOrItem?: string | Bookmark<TData>): Promise<void> {
        this._bookmarkClient.setCurrentBookmark(idOrItem);
    }

    public getAllBookmarks(): Observable<Bookmark<unknown>[]> {
        return this._bookmarkClient.getAllBookmarks();
    }

    public async getAllBookmarksAsync(): Promise<Bookmark<unknown>[]> {
        return this._bookmarkClient.getAllBookmarksAsync();
    }

    public updateBookmark<T>(bookmark: Bookmark<T>): Observable<Bookmark<T>> {
        return this._bookmarkClient.updateBookmark<T>(bookmark);
    }

    public async updateBookmarkAsync<T>(bookmark: Bookmark<T>): Promise<Bookmark<T>> {
        return this._bookmarkClient.updateBookmarkAsync<T>(bookmark);
    }

    public deleteBookmarkById(bookmarkId: string): Observable<string> {
        return this._bookmarkClient.deleteBookmarkById(bookmarkId);
    }

    public deleteBookmarkByIdAsync(bookmarkId: string): Promise<string> {
        return this._bookmarkClient.deleteBookmarkByIdAsync(bookmarkId);
    }

    public async addBookmarkFavoriteAsync(bookmarkId: string): Promise<void> {
        await this._bookmarkClient.addBookmarkFavoriteAsync(bookmarkId);
    }

    public async removeBookmarkFavoriteAsync(bookmarkId: string): Promise<void> {
        await this._bookmarkClient.removeBookmarkFavoriteAsync(bookmarkId);
    }

    public async verifyBookmarkFavoriteAsync(bookmarkId: string): Promise<boolean> {
        return await this._bookmarkClient.verifyBookmarkFavoriteAsync(bookmarkId);
    }

    public addStateCreator<T>(cb: CreateBookmarkFn<T>, key?: keyof T): VoidFunction {
        const bookmarkCreatorKey = key ? key : '#creator';

        if (this.#event) {
            this.#event?.dispatchEvent('onAddCreator', {
                source: this,
                canBubble: true,
                detail: { key, cb },
            });
        }

        this.bookmarkCreators[bookmarkCreatorKey] = cb;
        return () => {
            delete this.bookmarkCreators[bookmarkCreatorKey];
        };
    }

    public async createBookmark<T>(args: {
        name: string;
        description: string;
        isShared: boolean;
    }): Promise<Bookmark<T>> {
        const payload = await this.#createPayload();

        const contextId = this.config.getContextId && this.config.getContextId();
        const appKey =
            this.config.getCurrentAppIdentification && this.config.getCurrentAppIdentification();

        if (!appKey)
            throw new Error(`There is noe current application selected, can't create bookmark.`);

        const bookmark: CreateBookmark<unknown> = {
            ...args,
            appKey,
            contextId,
            sourceSystem: this.config.sourceSystem,
            payload,
        };

        return this._bookmarkClient.createBookmarkAsync(bookmark) as Promise<Bookmark<T>>;
    }

    #clearStateCreators = () => {
        this.bookmarkCreators = {};
    };

    async #createPayload() {
        const creator = this.bookmarkCreators;
        if (!creator || Object.keys(creator).length === 0) {
            throw Error('No creator registered on this BookmarkProvider');
        }

        if (typeof creator['#creator'] === 'function') {
            return creator['#creator']();
        }

        return await Object.entries(creator).reduce(async (cur, [key, fn]) => {
            return Object.assign(await cur, { [key]: await fn() });
        }, Promise.resolve({}));
    }

    public dispose() {
        this.#subscriptions.unsubscribe();
        this._bookmarkClient.dispose();
    }
}

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        /** dispatch before context changes */
        onNavigateToApp: FrameworkEvent<FrameworkEventInit<URL, IBookmarkModuleProvider>>;
        onAddCreator: FrameworkEvent<
            FrameworkEventInit<
                { cb: CreateBookmarkFn<unknown>; key?: keyof unknown },
                BookmarkModuleProvider
            >
        >;
    }
}
