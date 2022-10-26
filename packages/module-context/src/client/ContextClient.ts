import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Query, QueryCtorOptions } from '@equinor/fusion-observable/query';
import { QueryClientStatus } from '@equinor/fusion-observable/query/client';

import { ContextItem } from '../types';

export type ContextClientOptions = {
    query: QueryCtorOptions<ContextItem, { id: string }>;
    initial?: ContextItem;
};

export class ContextClient extends Observable<ContextItem> {
    #client: Query<ContextItem, { id: string }>;
    /** might change to reactive state, for comparing state with reducer */
    #currentContext$: BehaviorSubject<ContextItem | undefined>;

    get currentContext(): ContextItem | undefined {
        return this.#currentContext$.value;
    }

    get currentContext$(): Observable<ContextItem | undefined> {
        return this.#currentContext$.asObservable();
    }

    get status$(): Observable<QueryClientStatus> {
        return this.#client.client.pipe(map((x) => x.status));
    }

    get client(): Query<ContextItem, { id: string }> {
        return this.#client;
    }

    constructor(options: ContextClientOptions) {
        super((observer) => this.#currentContext$.subscribe(observer));
        this.#client = new Query(options.query);
        this.#currentContext$ = new BehaviorSubject<ContextItem | undefined>(options.initial);
    }

    public setCurrentContext(idOrItem?: string | ContextItem) {
        if (typeof idOrItem === 'string') {
            this.resolveContext(idOrItem)
                .pipe(catchError(() => EMPTY))
                .subscribe((value) => this.#currentContext$.next(value));
        } else {
            this.#currentContext$.next(idOrItem);
        }
    }

    public resolveContext(id: string): Observable<ContextItem> {
        return this.#client.query({ id }).pipe(map((x) => x.value));
    }
}

export default ContextClient;
