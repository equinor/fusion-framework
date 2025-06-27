import { Observable, BehaviorSubject, EMPTY, lastValueFrom, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import equal from 'fast-deep-equal';

import { Query, type QueryCtorOptions } from '@equinor/fusion-query';

import type { ContextItem } from '../types';

export type GetContextParameters = { id: string };

/**
 * `ContextClient` is an observable client for managing and retrieving context items.
 *
 * This class extends `Observable<ContextItem | null | undefined>`, allowing consumers to subscribe to context changes.
 * It encapsulates a `Query` instance for fetching context items by ID and maintains the current context state using a `BehaviorSubject`.
 *
 * ### Features
 * - Exposes the current context synchronously and as an observable stream.
 * - Provides methods to set the current context by ID or item, resolving and updating as needed.
 * - Supports asynchronous context resolution with optional await behavior.
 * - Handles errors during context resolution, unwrapping nested causes.
 * - Implements a `dispose` method to clean up internal subscriptions.
 *
 * @template ContextItem The type of the context item managed by the client.
 * @extends Observable<ContextItem | null | undefined>
 *
 * @todo - should this have `undefined` as a valid value?
 *
 * @example
 * ```typescript
 * const client = new ContextClient(options);
 * client.setCurrentContext('context-id');
 * client.currentContext$.subscribe(ctx => { ... });
 * ```
 */
export class ContextClient extends Observable<ContextItem | null | undefined> {
  #client: Query<ContextItem, { id: string }>;
  /** might change to reactive state, for comparing state with reducer */
  #currentContext$: BehaviorSubject<ContextItem | null | undefined>;

  /**
   * Gets the current context item.
   *
   * @returns The current {@link ContextItem}, or `null` if no context is set, or `undefined` if the context has not been initialized.
   */
  get currentContext(): ContextItem | null | undefined {
    return this.#currentContext$.value;
  }

  /**
   * An observable stream that emits the current context item.
   *
   * @remarks
   * This observable emits the current `ContextItem` whenever it changes.
   * It can emit `null` or `undefined` if there is no current context.
   *
   * @returns Observable that emits the current `ContextItem`, `null`, or `undefined`.
   */
  get currentContext$(): Observable<ContextItem | null | undefined> {
    return this.#currentContext$.asObservable();
  }

  /**
   * Gets the query client for retrieving a specific `ContextItem` by its ID.
   *
   * @returns A `Query` instance configured to fetch a `ContextItem` using an object containing an `id` property.
   */
  get client(): Query<ContextItem, { id: string }> {
    return this.#client;
  }

  constructor(options: QueryCtorOptions<ContextItem, GetContextParameters>) {
    super((observer) => this.#currentContext$.subscribe(observer));
    this.#client = new Query(options);
    this.#currentContext$ = new BehaviorSubject<ContextItem | null | undefined>(undefined);
  }

  /**
   * Sets the current context based on the provided identifier or context item.
   *
   * If a string identifier is provided, attempts to resolve the corresponding context asynchronously.
   * If a `ContextItem` or `null` is provided, updates the current context only if it differs from the existing one.
   *
   * @param idOrItem - The context identifier (string), a `ContextItem`, or `null`. If omitted, the current context may be cleared.
   */
  public setCurrentContext(idOrItem?: string | ContextItem | null): void {
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
   * Resolves a context item by its unique identifier.
   *
   * @param id - The unique identifier of the context item to resolve.
   * @returns An Observable that emits the resolved {@link ContextItem}.
   * @throws Rethrows the underlying error cause if present, otherwise throws the original error.
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
   * Resolves a context item asynchronously by its ID.
   *
   * @param id - The unique identifier of the context item to resolve.
   * @param opt - Optional settings for resolution.
   * @param opt.awaitResolve - If true, waits for the observable to complete and returns the last emitted value;
   * otherwise, returns the first emitted value.
   * @returns A promise that resolves to the requested {@link ContextItem}.
   */
  public resolveContextAsync(id: string, opt?: { awaitResolve: boolean }): Promise<ContextItem> {
    const fn = opt?.awaitResolve ? lastValueFrom : firstValueFrom;
    return fn(this.resolveContext(id));
  }

  public dispose(): void {
    this.#currentContext$.complete();
  }
}

export default ContextClient;
