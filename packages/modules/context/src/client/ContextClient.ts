import { Observable, BehaviorSubject, EMPTY, lastValueFrom, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import equal from 'fast-deep-equal';

import { Query, QueryCtorOptions } from '@equinor/fusion-query';

import { ContextItem } from '../types';

export type GetContextParameters = { id: string };

export class ContextClient extends Observable<ContextItem | null> {
    #client: Query<ContextItem, { id: string }>;
    /** might change to reactive state, for comparing state with reducer */
    #currentContext$: BehaviorSubject<ContextItem | null | undefined>;

    get currentContext(): ContextItem | null | undefined {
        return this.#currentContext$.value;
    }

    get currentContext$(): Observable<ContextItem | null | undefined> {
        return this.#currentContext$.asObservable();
    }

    get client(): Query<ContextItem, { id: string }> {
        return this.#client;
    }

    constructor(options: QueryCtorOptions<ContextItem, GetContextParameters>) {
        super((observer) => this.#currentContext$.subscribe(observer));
        this.#client = new Query(options);
        this.#currentContext$ = new BehaviorSubject<ContextItem | null | undefined>(undefined);
    }

    public setCurrentContext(idOrItem?: string | ContextItem | null) {
        if (typeof idOrItem === 'string') {
            // TODO - compare context
            this.resolveContext(idOrItem)
                // TODO should this catch error?
                .pipe(catchError(() => EMPTY))
                .subscribe((value) => this.setCurrentContext(value));
            /** only add context if not match */
        } else if (!equal(idOrItem, this.#currentContext$.value)) {
            this.#currentContext$.next(idOrItem);
        }
    }

    public resolveContext(id: string): Observable<ContextItem> {
        return this.#client.query({ id }).pipe(
            map((x) => x.value),
            // unwrap error
            catchError((err) => {
                if (err.cause) {
                    throw err.cause;
                }
                throw err;
            }),
        );
    }

    public resolveContextAsync(id: string, opt?: { awaitResolve: boolean }): Promise<ContextItem> {
        const fn = opt?.awaitResolve ? lastValueFrom : firstValueFrom;
        return fn(this.resolveContext(id));
    }

    public dispose(): void {
        this.#currentContext$.complete();
    }
}

export default ContextClient;
