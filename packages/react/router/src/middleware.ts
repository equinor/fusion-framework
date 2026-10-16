import type { MiddlewareFunction as ReactRouterMiddlewareFunction } from 'react-router';

import type {
  FusionRouterContext,
  MaybePromise,
  RouteContextProvider,
  UrlParameters,
} from './types.js';

/**
 * Upstream React Router v8 Data Mode middleware arguments (`request`, `url`, `pattern`,
 * `params`, `context`). Derived from the upstream signature so Fusion middleware stays in
 * lock-step with the router it runs on.
 */
type UpstreamMiddlewareArgs = Parameters<ReactRouterMiddlewareFunction>[0];

/**
 * Function passed to a route middleware that runs the rest of the matched chain.
 *
 * Calling `await next()` runs every downstream middleware and then the route loaders or
 * action, and resolves once they have completed. Code placed after `await next()` runs
 * while the chain unwinds, inner route first. `next()` may only be called once per
 * middleware invocation; React Router throws on a second call.
 *
 * @template TResult - Value produced by the downstream chain. Client middleware should
 *   return this value unchanged, or return nothing.
 */
export type MiddlewareNextFunction<TResult = unknown> = Parameters<
  ReactRouterMiddlewareFunction<TResult>
>[1];

/**
 * Arguments passed to a Fusion route middleware function.
 *
 * These are the React Router v8 Data Mode middleware arguments with the Fusion router
 * context added as `fusion`, mirroring what loaders and actions receive.
 *
 * - `request` is the navigation, fetcher or submission request. Its `signal` aborts when the
 *   router cancels the operation, for example when the user navigates elsewhere.
 * - `signal` is the same `AbortSignal` as `request.signal`, exposed for convenience.
 * - `params` are the dynamic URL parameters of the matched location.
 * - `context` is the per-execution React Router context provider. Values written with
 *   `context.set(...)` are visible to downstream middleware, loaders and actions in the same
 *   execution only; every navigation, fetcher call and revalidation gets a fresh provider.
 * - `fusion` exposes the Fusion modules and the custom `context` given to `<Router>`.
 *
 * @template TParams - Shape of the dynamic URL parameters.
 * @template TContext - Fusion router context type, extend it to type `fusion.context`.
 */
export interface MiddlewareFunctionArgs<
  TParams extends UrlParameters = UrlParameters,
  TContext extends FusionRouterContext = FusionRouterContext,
> extends Omit<UpstreamMiddlewareArgs, 'params' | 'context'> {
  /** Dynamic route parameters of the matched location. */
  params: TParams;
  /**
   * Per-execution context provider, the same type loaders and actions receive as `context`.
   * Values set here are read by downstream middleware, loaders and actions of this execution.
   */
  context: RouteContextProvider;
  /** Cancellation signal of this execution, identical to `request.signal`. */
  signal: AbortSignal;
  /** Fusion Framework modules and the custom context passed to `<Router>`. */
  fusion: TContext;
}

/**
 * Route middleware that runs on the React Router v8 client Data Mode middleware lifecycle.
 *
 * Export an array of these as `middleware` from a route module (or set `middleware` on a
 * `RouteObject`). The router builds the chain from every matched route, outermost route
 * first and in array order, before it runs any loader or action of the matched routes.
 * Middleware runs for initial and subsequent navigations, fetcher loads and submissions,
 * actions and revalidations. It also runs for routes that only render a component.
 *
 * - Throw `redirect(...)` to redirect with normal router semantics.
 * - Throw any other value to stop the chain; the error renders in the nearest error boundary
 *   and no downstream loader or action runs.
 * - Returning without calling `next()` lets React Router continue the chain automatically; it
 *   is not an access denial.
 *
 * This is client middleware; it is not React Router Framework Mode `clientMiddleware`, it is
 * not a server middleware and it is not a per-render hook.
 *
 * @template TParams - Shape of the dynamic URL parameters.
 * @template TContext - Fusion router context type.
 * @template TResult - Value produced by `next()`.
 *
 * @example
 * ```ts
 * // src/pages/ReportsPage.tsx
 * import { redirect, type MiddlewareFunction } from '@equinor/fusion-framework-react-router';
 *
 * const requireProject: MiddlewareFunction<{ projectId?: string }> = ({ params }) => {
 *   if (!params.projectId) {
 *     throw redirect('/projects');
 *   }
 * };
 *
 * const timing: MiddlewareFunction = async ({ request }, next) => {
 *   const start = performance.now();
 *   const result = await next();
 *   console.debug(request.url, performance.now() - start);
 *   return result;
 * };
 *
 * export const middleware = [requireProject, timing];
 * ```
 */
export type MiddlewareFunction<
  TParams extends UrlParameters = UrlParameters,
  TContext extends FusionRouterContext = FusionRouterContext,
  TResult = unknown,
> = (
  args: MiddlewareFunctionArgs<TParams, TContext>,
  next: MiddlewareNextFunction<TResult>,
) => MaybePromise<TResult | undefined>;
