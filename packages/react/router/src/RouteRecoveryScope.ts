import type { DataRouter, RouterFetchOptions, RouterNavigateOptions } from 'react-router';

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
  #lastClaim: RouteOperationTarget | undefined;
  #active = false;

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
    const target: RouteOperationTarget = { scope: this, operation };
    this.#lastClaim = target;
    return target;
  }

  /**
   * Starts a router operation and returns the execution target it claimed synchronously.
   *
   * @param run - Router call to start.
   * @returns The operation promise and the target of its execution, if one was created.
   */
  public start(run: () => Promise<void>): {
    readonly done: Promise<void>;
    readonly target: RouteOperationTarget | undefined;
  } {
    this.#lastClaim = undefined;
    const done = run();
    const target = this.#lastClaim;
    this.#lastClaim = undefined;
    return { done, target };
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
