import { Observable, BehaviorSubject, EMPTY, lastValueFrom, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import equal from 'fast-deep-equal';

import { Query, QueryCtorOptions } from '@equinor/fusion-query';

import { ContextItem } from '../types';

export type GetContextParameters = { id: string };

/**
 * ContextClient provides an Observable interface for ContextItem entities and manages their state.
 */
export class ContextClient extends Observable<ContextItem | null> {
    #client: Query<ContextItem, { id: string }>;
    #currentContext$: BehaviorSubject<ContextItem | null | undefined>;

    /**
     * Gets the current context value.
     */
    get currentContext(): ContextItem | null | undefined {
        return this.#currentContext$.value;
    }

    /**
     * Returns an Observable of the current context value.
     */
    get currentContext$(): Observable<ContextItem | null | undefined> {
        return this.#currentContext$.asObservable();
    }

    /**
     * Gets the underlying Query client.
     */
    get client(): Query<ContextItem, { id: string }> {
        return this.#client;
    }

    /**
     * Initializes a new instance of the ContextClient class.
     * @param options - The constructor options for the Query.
     */
    constructor(options: QueryCtorOptions<ContextItem, GetContextParameters>) {
        super((observer) => this.#currentContext$.subscribe(observer));
        this.#client = new Query(options);
        this.#currentContext$ = new BehaviorSubject<ContextItem | null | undefined>(undefined);
    }

    /**
     * Sets the current context based on the provided id or ContextItem.
     * @param idOrItem - The context id or ContextItem to set as the current context.
     */
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

    /**
     * Resolves a context by its id and returns an Observable of the ContextItem.
     * @param id - The id of the context to resolve.
     * @returns An Observable of the resolved ContextItem.
     */
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

    /**
     * Resolves a context asynchronously by its id and returns a Promise of the ContextItem.
     * @param id - The id of the context to resolve.
     * @param opt - Optional settings for the resolution process.
     * @returns A Promise of the resolved ContextItem.
     */
    public resolveContextAsync(id: string, opt?: { awaitResolve: boolean }): Promise<ContextItem> {
        const fn = opt?.awaitResolve ? lastValueFrom : firstValueFrom;
        return fn(this.resolveContext(id));
    }

    /**
     * Disposes of the resources held by the client.
     */
    public dispose(): void {
        this.#currentContext$.complete();
    }
}

export default ContextClient;
