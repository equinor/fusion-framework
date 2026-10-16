import type { DataRouter, RouterFetchOptions, RouterNavigateOptions } from 'react-router';

import {
  RequireRolesFetcherRecovery,
  type RequireRolesFetcherRecoveryInit,
} from './RequireRolesFetcherRecovery.js';

/**
 * Router operation that started a middleware execution, as recorded by {@link RouteRecoveryScope}.
 *
 * - `navigate`: `router.navigate(to, options)` from links, `useNavigate`, `<Form>` or `useSubmit`.
 * - `fetch`: `router.fetch(key, routeId, href, options)` from a fetcher.
 * - `router`: started by the router itself (initial load, history POP, revalidation, redirect).
 */
export type RouteOperation =
  | { readonly type: 'navigate'; readonly options?: RouterNavigateOptions }
  | {
      readonly type: 'fetch';
      readonly key: string;
      readonly routeId: string;
      readonly href: string | null;
      readonly options?: RouterFetchOptions;
    }
  | { readonly type: 'router' };

/**
 * Execution-scoped link between a middleware execution and the router that started it.
 */
export interface RouteOperationTarget {
  /** Scope of the Fusion `Router` instance that created the execution. */
  readonly scope: RouteRecoveryScope;
  /** Operation that started the execution. */
  readonly operation: RouteOperation;
}

/** Operation used when the router starts an execution on its own. */
const routerOperation: RouteOperation = Object.freeze({ type: 'router' });

/**
 * Per-`Router` record of which public router operation started each middleware execution.
 *
 * React Router calls `getContext()` synchronously inside `router.navigate()` and
 * `router.fetch()`, before their first `await`, and creates exactly one context per navigation or
 * fetcher call. The scope wraps those two instance methods so the operation and its original
 * arguments are pending only during that synchronous window; `getContext()` claims it and every
 * middleware of the execution can read it from `context`. Executions the router starts itself
 * (initial load, POP, revalidation, redirects) claim `{ type: 'router' }`.
 *
 * Upstream instrumentation hooks only observe operations and do not expose the fetcher route,
 * navigation state or submission options needed to replay one, so the instance methods are wrapped
 * directly, the same way React Router's own client instrumentation does.
 */
export class RouteRecoveryScope {
  /** Router whose operations are tracked and replayed. */
  public readonly router: DataRouter;

  #pending: RouteOperation | undefined;
  #active = false;
  #hosts = 0;
  #holds: readonly RequireRolesFetcherRecovery[] = [];
  readonly #listeners = new Set<() => void>();

  /**
   * Creates the scope and wraps the router's `navigate` and `fetch` methods.
   *
   * Must run before the router is rendered, because data hooks read these methods from the
   * router instance.
   *
   * @param router - Router instance created by the Fusion `Router` component.
   */
  constructor(router: DataRouter) {
    this.router = router;
    const navigate = router.navigate.bind(router);
    const fetch = router.fetch.bind(router);

    router.navigate = ((
      to: Parameters<DataRouter['navigate']>[0],
      options?: RouterNavigateOptions,
    ) =>
      this.#track({ type: 'navigate', options }, () =>
        // Numeric deltas are history traversals; the history listener starts them as POP later.
        typeof to === 'number' ? navigate(to) : navigate(to, options),
      )) as DataRouter['navigate'];

    router.fetch = (key, routeId, href, options) =>
      this.#track({ type: 'fetch', key, routeId, href, options }, () =>
        fetch(key, routeId, href, options),
      );
  }

  /**
   * Whether the owning `Router` is mounted; replays are refused for disposed routers.
   *
   * @returns True between the router's initialize effect and its cleanup.
   */
  public get active(): boolean {
    return this.#active;
  }

  /**
   * Marks the router as mounted or disposed. Called from the `Router` effect lifecycle.
   *
   * @param active - True after initialize, false on cleanup.
   */
  public setActive(active: boolean): void {
    this.#active = active;
    // A disposed router can never resume a hold; end them before their requests are aborted.
    if (!active) {
      this.#dismissHolds(() => true);
    }
  }

  /**
   * Whether a fetcher-recovery host (`useRequireRolesFetcherRecoveries`) is mounted for this
   * router. Without one, a denied fetcher execution fails at once instead of being held.
   *
   * @returns True while at least one host is mounted and the router is active.
   */
  public get canHoldFetchers(): boolean {
    return this.#active && this.#hosts > 0;
  }

  /**
   * Holds a denied fetcher execution until the user recovers access or dismisses the denial.
   *
   * @param init - Denial and fetcher execution identity.
   * @returns The hold, or `undefined` when no host can show it (the caller must fail explicitly).
   */
  public holdFetcher(
    init: RequireRolesFetcherRecoveryInit,
  ): RequireRolesFetcherRecovery | undefined {
    // A hold nobody can see would leave the fetcher pending forever; fail instead.
    if (!this.canHoldFetchers) {
      return undefined;
    }
    const hold = new RequireRolesFetcherRecovery(init);
    // An execution aborted before it was held has nothing to recover.
    if (!hold.pending) {
      return hold;
    }
    const unsubscribe = hold.subscribe(() => {
      // Ended holds leave the host list; status changes only refresh it.
      if (!hold.pending) {
        unsubscribe();
        // Replace the list so `useSyncExternalStore` hosts see a new snapshot.
        this.#holds = this.#holds.filter((entry) => entry !== hold);
      } else {
        this.#holds = [...this.#holds];
      }
      this.#notify();
    });
    this.#holds = [...this.#holds, hold];
    this.#notify();
    return hold;
  }

  /**
   * Registers a mounted fetcher-recovery host.
   *
   * @returns Unregisters the host; the last host leaving dismisses every pending hold.
   */
  public addFetcherHost(): () => void {
    this.#hosts += 1;
    let removed = false;
    return () => {
      // Each registration is released once.
      if (removed) {
        return;
      }
      removed = true;
      this.#hosts -= 1;
      // Defer so a host that remounts in the same commit (for example React StrictMode) keeps the
      // holds; holds nobody can show any more must not leave fetchers pending.
      queueMicrotask(() => {
        // A host registered again meanwhile still shows the holds.
        if (this.#hosts === 0) {
          this.#dismissHolds(() => true);
        }
      });
    };
  }

  /**
   * Subscribes to changes of {@link getFetcherHolds}.
   *
   * @param listener - Called after every change.
   * @returns Unsubscribe function.
   */
  public subscribeFetcherHolds = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  /**
   * Pending fetcher holds of this router, in the order they were denied.
   *
   * @returns An immutable list that is replaced whenever a hold is added, changes or ends.
   */
  public getFetcherHolds = (): readonly RequireRolesFetcherRecovery[] => this.#holds;

  /**
   * Dismisses holds whose owner route is no longer rendered.
   *
   * Called by hosts after a committed location change. The fetcher owners of those routes have
   * unmounted in the same commit, so React Router discards the dismissed execution's outcome
   * instead of showing it, and the held action is never submitted for an owner that is gone.
   *
   * @param routeIds - Ids of the currently matched routes.
   */
  public dismissFetcherHoldsOutside(routeIds: readonly string[]): void {
    this.#dismissHolds((hold) => !routeIds.includes(hold.routeId));
  }

  /**
   * Dismisses matching pending holds.
   *
   * @param predicate - Selects holds to dismiss.
   */
  #dismissHolds(predicate: (hold: RequireRolesFetcherRecovery) => boolean): void {
    // Select first into a copy: each dismissal replaces `#holds` while the loop runs.
    const matching = this.#holds.filter(predicate);
    // Dismissal is idempotent, so a hold that ended meanwhile is skipped safely.
    for (const hold of matching) {
      hold.dismiss();
    }
  }

  /** Calls every hold listener. */
  #notify(): void {
    // Copy so listeners may unsubscribe while being notified.
    for (const listener of [...this.#listeners]) {
      listener();
    }
  }

  /**
   * Claims the operation that started the execution currently creating its context.
   *
   * @returns The target stored in the execution's context provider.
   */
  public claim(): RouteOperationTarget {
    const operation = this.#pending ?? routerOperation;
    // One navigation or fetcher call creates one context; later contexts belong to the router.
    this.#pending = undefined;
    return { scope: this, operation };
  }

  /**
   * Runs a router method while its operation is pending for `claim()`.
   *
   * @param operation - Operation being started.
   * @param run - Original router method call.
   * @returns The router method result.
   */
  #track(operation: RouteOperation, run: () => Promise<void>): Promise<void> {
    this.#pending = operation;
    try {
      return run();
    } finally {
      // Blocked, hash-only or 404 navigations never create a context; do not leak the operation.
      this.#pending = undefined;
    }
  }
}

export default RouteRecoveryScope;
