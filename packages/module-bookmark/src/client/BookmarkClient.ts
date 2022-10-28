import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Query, QueryCtorOptions } from '@equinor/fusion-observable/query';
import { QueryClientStatus } from '@equinor/fusion-observable/query/client';

import { ApiBookmarkEntityV1 } from '../types';

export type BookmarkClientOptions<TPayload = unknown> = {
    query: QueryCtorOptions<ApiBookmarkEntityV1<TPayload>, { id: string }>;
    initial?: ApiBookmarkEntityV1<TPayload>;
};

export class BookmarkClient<TPayload> extends Observable<ApiBookmarkEntityV1<TPayload>> {
    #client: Query<ApiBookmarkEntityV1<TPayload>, { id: string }>;
    /** might change to reactive state, for comparing state with reducer */
    #currentBookmark$: BehaviorSubject<ApiBookmarkEntityV1<TPayload> | undefined>;

    get currentBookmark(): ApiBookmarkEntityV1<TPayload> | undefined {
        return this.#currentBookmark$.value;
    }

    get currentBookmark$(): Observable<ApiBookmarkEntityV1<TPayload> | undefined> {
        return this.#currentBookmark$.asObservable();
    }

    get status$(): Observable<QueryClientStatus> {
        return this.#client.client.pipe(map((x) => x.status));
    }

    get client(): Query<ApiBookmarkEntityV1<TPayload>, { id: string }> {
        return this.#client;
    }

    constructor(options: BookmarkClientOptions<TPayload>) {
        super((observer) => this.#currentBookmark$.subscribe(observer));
        this.#client = new Query(options.query);
        this.#currentBookmark$ = new BehaviorSubject<ApiBookmarkEntityV1<TPayload> | undefined>(
            options.initial
        );
    }

    public setCurrentBookmark(idOrItem?: string | ApiBookmarkEntityV1<TPayload>) {
        if (typeof idOrItem === 'string') {
            this.resolveBookmark(idOrItem)
                .pipe(catchError(() => EMPTY))
                .subscribe((value) => this.#currentBookmark$.next(value));
        } else {
            this.#currentBookmark$.next(idOrItem);
        }
    }

    public clearCurrentBookmark() {
        this.#currentBookmark$.next(undefined);
    }

    public resolveBookmark(id: string): Observable<ApiBookmarkEntityV1<TPayload>> {
        return this.#client.query({ id }).pipe(map((x) => x.value));
    }
}

export default BookmarkClient;
