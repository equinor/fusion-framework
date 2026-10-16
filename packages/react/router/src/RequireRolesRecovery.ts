import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';
import type { DataRouter, RouterFetchOptions, RouterNavigateOptions } from 'react-router';

import type { RolesMiddlewareMetadata } from './middleware-metadata/types.js';
import type { RouteOperationTarget } from './RouteRecoveryScope.js';

/**
 * Router operation a role-gate denial interrupted, and therefore what a recovery retries.
 *
 * - `navigation`: a page load, link or `GET` navigation, history traversal or revalidation.
 *   Retried by reloading the current location with a replace navigation, which runs middleware,
 *   loaders and components again.
 * - `submission`: a `<Form>`/`useSubmit` navigation whose action was denied. Retried by
 *   submitting the same request once more (replace navigation).
 * - `fetcher-submission`: a `fetcher.submit`/`<fetcher.Form>` action that was denied. Retried by
 *   submitting the same request through the same fetcher key and route once more, then reloading
 *   the current location. The denial unmounted the fetcher's owner, whose remount uses a new
 *   fetcher key, so the replayed action's data is not delivered to the new owner.
 * - `fetcher-load`: a `fetcher.load` that was denied. The load is not replayed, because its result
 *   would land on the unmounted owner's key; recovery reloads the current location to restore the
 *   owner, which can load again.
 */
export type RequireRolesRecoveryOperation =
  | 'navigation'
  | 'submission'
  | 'fetcher-submission'
  | 'fetcher-load';

/**
 * Final outcome of {@link RequireRolesRecovery.retry}.
 *
 * - `retried`: access confirmed and the interrupted operation ran again.
 * - `restored`: access confirmed and the location was reloaded (`fetcher-load` only).
 * - `still-denied`: a fresh check still denies access; nothing was retried.
 * - `check-failed`: the fresh check failed; access is unknown and nothing was retried.
 * - `stale`: the denial is no longer shown or its router is gone; nothing was retried.
 * - `cancelled`: the caller aborted; nothing was retried.
 */
export type RequireRolesRecoveryResult =
  | 'retried'
  | 'restored'
  | 'still-denied'
  | 'check-failed'
  | 'stale'
  | 'cancelled';

/** Provider methods recovery relies on. */
type RolesAccessChecker = Pick<IRolesProvider, 'hasAccessRole'>;

/** Inputs captured by `requireRoles` when it denies access. */
export interface RequireRolesRecoveryInit {
  /** Error thrown by the middleware; it identifies the denial in router state. */
  readonly error: object;
  /** Normalized requirement that was denied. */
  readonly requirement: RolesMiddlewareMetadata;
  /** Roles provider that made the decision. */
  readonly provider: RolesAccessChecker;
  /** Operation and router scope of the denied middleware execution. */
  readonly target: RouteOperationTarget;
  /** Request of the denied middleware execution. */
  readonly request: Request;
}

/** Recoveries keyed by the denial error they belong to. */
const registry = new WeakMap<object, RequireRolesRecovery>();

/**
 * Removes the router basename from a request pathname so `router.navigate` can add it again.
 *
 * @param pathname - Absolute request pathname.
 * @param basename - Router basename.
 * @returns Router-relative pathname.
 */
const stripBasename = (pathname: string, basename: string): string => {
  const base = basename.replace(/\/+$/, '');
  // Root basenames and paths outside the basename are already router-relative.
  if (base === '' || !pathname.startsWith(base)) {
    return pathname;
  }
  return pathname.slice(base.length) || '/';
};

/** Execution targets that a `requireRoles` gate denied. */
const deniedTargets = new WeakSet<RouteOperationTarget>();

/**
 * Reloads the router's current location with a replace navigation.
 *
 * Unlike `revalidate()`, a navigation commits a new location, which is what React Router's route
 * error boundaries observe to drop the error they display.
 *
 * @param router - Router to reload.
 * @returns Resolves when the navigation completed.
 */
const reload = (router: DataRouter): Promise<void> => {
  const { pathname, search, hash, state } = router.state.location;
  return router.navigate(
    { pathname: stripBasename(pathname, router.basename ?? '/'), search, hash },
    { replace: true, state, preventScrollReset: true },
  );
};

/**
 * Retry plan for a denied execution, chosen from the request method and the recorded operation.
 *
 * @param target - Operation and router scope of the denied execution.
 * @param request - Request of the denied execution.
 * @returns Operation kind and the router calls that retry it.
 */
const planRetry = (
  target: RouteOperationTarget,
  request: Request,
): {
  readonly operation: RequireRolesRecoveryOperation;
  readonly run: () => Promise<RequireRolesRecoveryResult>;
} => {
  const { scope, operation } = target;
  const { router } = scope;
  const isSubmission = request.method !== 'GET';

  // Action-phase denials keep the submitted body on the original call options; replay exactly that.
  if (isSubmission && operation.type === 'navigate' && operation.options) {
    const url = new URL(request.url);
    const href = `${stripBasename(url.pathname, router.basename ?? '/')}${url.search}${url.hash}`;
    // Resolution helpers no longer apply: `href` is the resolved action URL.
    const { relative: _relative, fromRouteId: _fromRouteId, ...options } = operation.options;
    return {
      operation: 'submission',
      run: async () => {
        // The failed submission already committed its location; do not add a history entry.
        await router.navigate(href, { ...options, replace: true } as RouterNavigateOptions);
        return 'retried';
      },
    };
  }

  // Fetcher actions replay through the same key and route so React Router revalidates as usual.
  if (isSubmission && operation.type === 'fetch' && operation.options) {
    const { key, routeId, href, options } = operation;
    return {
      operation: 'fetcher-submission',
      run: async () => {
        const replay = scope.start(() =>
          router.fetch(key, routeId, href, options as RouterFetchOptions),
        );
        await replay.done;
        // A repeated denial is shown by the router as a new error with its own recovery; report it
        // and keep the reload from replacing it.
        if (replay.target && deniedTargets.has(replay.target)) {
          return 'still-denied';
        }
        // Only reset the error UI when the user has not started another navigation meanwhile.
        if (router.state.navigation.state === 'idle') {
          await reload(router);
        }
        return 'retried';
      },
    };
  }

  // A denied fetcher load unmounted its owner; React Router discards loads for unmounted keys.
  if (!isSubmission && operation.type === 'fetch') {
    return {
      operation: 'fetcher-load',
      run: async () => {
        await reload(router);
        return 'restored';
      },
    };
  }

  // Loader-phase denials re-run middleware, loaders and components by reloading the location.
  return {
    operation: 'navigation',
    run: async () => {
      await reload(router);
      return 'retried';
    },
  };
};

/**
 * Recovery for one role-gate denial raised by `requireRoles` inside a Fusion `Router`.
 *
 * After the user activates access through the existing Roles recovery UI, {@link retry} checks
 * the requirement again with `refresh: true` and, only when access is now granted and the denial
 * is still the one the router shows, re-runs the operation that was denied. A recovery replays
 * at most once; concurrent calls share one attempt.
 *
 * Use {@link useRequireRolesRecovery} from route error elements instead of this class directly.
 */
export class RequireRolesRecovery {
  /**
   * Associates a recovery with the denial error it belongs to.
   *
   * @param recovery - Recovery to register; keyed by its denial error.
   */
  public static attach(recovery: RequireRolesRecovery): void {
    registry.set(recovery.#error, recovery);
    deniedTargets.add(recovery.#target);
  }

  /**
   * Finds the recovery registered for a route error.
   *
   * @param error - Value from `useRouteError()`.
   * @returns The recovery, or `undefined` when the error is not a recoverable role-gate denial.
   */
  public static from(error: unknown): RequireRolesRecovery | undefined {
    // Only objects can be WeakMap keys; other route errors are never role-gate denials.
    if (typeof error !== 'object' || error === null) {
      return undefined;
    }
    return registry.get(error);
  }

  /** Operation that was denied and will be retried. */
  public readonly operation: RequireRolesRecoveryOperation;
  /** Requirement checked again before retrying. */
  public readonly requirement: RolesMiddlewareMetadata;

  readonly #error: object;
  readonly #provider: RolesAccessChecker;
  readonly #target: RouteOperationTarget;
  readonly #run: () => Promise<RequireRolesRecoveryResult>;
  #attempt: Promise<RequireRolesRecoveryResult> | undefined;
  #final: RequireRolesRecoveryResult | undefined;

  /**
   * Creates the recovery for a denied middleware execution.
   *
   * @param init - Denial error, requirement, provider, operation target and request.
   */
  constructor(init: RequireRolesRecoveryInit) {
    this.#error = init.error;
    this.requirement = init.requirement;
    this.#provider = init.provider;
    this.#target = init.target;
    const plan = planRetry(init.target, init.request);
    this.operation = plan.operation;
    this.#run = plan.run;
  }

  /**
   * Router that showed the denial.
   *
   * @returns The router instance the recovery replays into.
   */
  public get router(): DataRouter {
    return this.#target.scope.router;
  }

  /**
   * Checks access again and retries the denied operation when it is granted and still relevant.
   *
   * Call it only after a user-driven access activation (for example from `RoleErrorView`'s
   * `onRetry`). Concurrent calls share one attempt; after a retry ran, later calls return the same
   * result without running it again.
   *
   * @param signal - Aborted when the caller (typically the error element) is gone.
   * @returns The recovery outcome.
   */
  public retry(signal?: AbortSignal): Promise<RequireRolesRecoveryResult> {
    // Replays are one-shot; a second request must never submit the same action again.
    if (this.#final) {
      return Promise.resolve(this.#final);
    }
    this.#attempt ??= this.#runAttempt(signal).finally(() => {
      this.#attempt = undefined;
    });
    return this.#attempt;
  }

  /**
   * Whether the router still shows this denial and can safely run a retry now.
   *
   * @returns False when the router is disposed, busy with another navigation or shows other errors.
   */
  #isRelevant(): boolean {
    const { scope } = this.#target;
    const { state } = scope.router;
    // A disposed router, a newer navigation or a cleared denial means the user moved on.
    if (!scope.active || state.navigation.state !== 'idle') {
      return false;
    }
    return Object.values(state.errors ?? {}).includes(this.#error);
  }

  /**
   * Runs one recovery attempt.
   *
   * @param signal - Caller abort signal.
   * @returns The attempt outcome.
   */
  async #runAttempt(signal: AbortSignal | undefined): Promise<RequireRolesRecoveryResult> {
    // A caller that is already gone must not trigger any checks.
    if (signal?.aborted) {
      return 'cancelled';
    }
    // A denial the router no longer shows has nothing left to recover.
    if (!this.#isRelevant()) {
      return 'stale';
    }
    let granted: boolean;
    try {
      // `refresh` bypasses the provider cache so the activation the user just made is observed.
      granted = await this.#provider.hasAccessRole(this.requirement.roles, {
        required: this.requirement.mode === 'all',
        refresh: true,
      });
    } catch {
      return signal?.aborted ? 'cancelled' : 'check-failed';
    }
    // The provider has no abort support; discard results for callers that went away meanwhile.
    if (signal?.aborted) {
      return 'cancelled';
    }
    // The operation is only retried when the fresh check confirms access.
    if (granted !== true) {
      return 'still-denied';
    }
    // The user may have navigated elsewhere during the check; never replay a stale operation.
    if (!this.#isRelevant()) {
      return 'stale';
    }
    // Mark the replay before it starts so concurrent or later calls can never run it twice.
    this.#final = 'retried';
    const result = await this.#run();
    // A replay denied again did not run the operation, so a later activation may retry it.
    this.#final = result === 'still-denied' ? undefined : result;
    return result;
  }
}

export default RequireRolesRecovery;
