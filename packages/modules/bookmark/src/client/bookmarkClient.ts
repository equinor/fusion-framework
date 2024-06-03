import { Query } from '@equinor/fusion-query';
import { Bookmark, IBookmarksClient } from '../types';
import { Observable, from, tap } from 'rxjs';
import { QueryCache, type QueryCacheRecord } from '@equinor/fusion-query/cache';

class BookmarkClient {
    #api: IBookmarksClient;

    #bookmarkQuery: Query<Bookmark, string>;
    #bookmarksQuery: Query<Array<Bookmark>, void>;

    constructor(args: { api: IBookmarksClient }) {
        this.#api = args.api;

        this.#bookmarkQuery = new Query({
            client: {
                fn: this.#api.getById,
            },
            key: (id: string) => id,
            expire: 5 * 60 * 1000,
        });

        this.#bookmarksQuery = new Query({
            client: {
                fn: this.#api.getAll,
            },
            key: () => 'all-bookmarks',
            expire: 5 * 60 * 1000,
        });
    }

    public createBookmark<T>(
        bookmark: Partial<Bookmark> & Required<Pick<Bookmark<T>, 'name' | 'payload'>>,
    ): Observable<Bookmark<T>> {
        return from(this.#api.create(bookmark));
    }

    public createBookmarkAsync<T>(
        ...args: Parameters<IBookmarksClient['create']>
    ): Observable<Bookmark<T>> {
        return from(this.#api.create(...args)) as Observable<Bookmark<T>>;
    }

    public updateBookmark<T>(
        bookmark: Partial<Bookmark> & Pick<Bookmark, 'id'>,
    ): Observable<Bookmark<T>> {
        return new Observable<Bookmark<T>>((subscriber) => {
            from(this.#api.update<T>(bookmark)).subscribe({
                next: (bookmark) => {
                    try {
                        this.#bookmarkQuery.mutate(bookmark.id, {
                            value: bookmark,
                            updated: Date.now(),
                        });
                    } finally {
                        this.#bookmarksQuery.invalidate();
                        subscriber.next(bookmark);
                    }
                },
                error: (error) => subscriber.error(error),
                complete: () => subscriber.complete(),
            });
        });
    }
}
