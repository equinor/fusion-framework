import type { MiddlewareFunction } from './middleware.js';
import type { FusionRouterContext, UrlParameters } from './types.js';

/**
 * Defines middleware with the Fusion router's argument and continuation types.
 *
 * Use `createMiddleware` to infer route middleware arguments without annotating
 * each callback. It returns the original function without changing execution,
 * errors or cancellation. Specialized callbacks retain their exact signature.
 *
 * @template TParams - Shape of the dynamic route parameters.
 * @template TContext - Fusion modules and application context supplied by the router.
 * @template TResult - Value produced by the downstream middleware chain.
 * @template TMiddleware - Exact callback type, preserved for reusable helpers.
 * @param middleware - Callback implementing the Fusion middleware contract.
 * @returns The same callback with its signature preserved.
 *
 * @example
 * ```ts
 * import { createMiddleware } from '@equinor/fusion-framework-react-router';
 *
 * export const middleware = [
 *   createMiddleware(async ({ signal }, next) => {
 *     signal.throwIfAborted();
 *     return next();
 *   }),
 * ];
 * ```
 */
export function createMiddleware<
  TParams extends UrlParameters = UrlParameters,
  TContext extends FusionRouterContext = FusionRouterContext,
  TResult = unknown,
  TMiddleware extends MiddlewareFunction<TParams, TContext, TResult> = MiddlewareFunction<
    TParams,
    TContext,
    TResult
  >,
>(middleware: TMiddleware): TMiddleware {
  return middleware;
}
